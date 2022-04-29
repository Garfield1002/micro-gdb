from time import sleep
from typing import Optional
from pygdbmi.IoManager import IoManager
import re
import os
from Singleton import Singleton
from PTYHandler import PTYHandler


class GDBHandler(metaclass=Singleton):
    """
    A singleton for handling all interactions with GDB
    """

    def _is_sp(self, reg_name: str):
        return reg_name == "esp" or reg_name == "rsp"

    def _is_ip(self, reg_name: str):
        return reg_name == "eip" or reg_name == "rip"

    def update_memory(self):
        """
        Get a dump of the current memory
        """

        if self.sp is None:
            # If there are no registers then there must not be any memory
            return

        self.memory.clear()

        # The bounds of the memory dump (aligned to 5 bytes)
        start = ((self.sp - 384) >> 5) << 5

        # clears stdout
        self.gdbmi.get_gdb_response(0, False)
        response = self.gdbmi.write(f"-data-read-memory {start} z 2 32 8 .")

        payload = response[1]

        if payload["message"] != "done":
            return

        self.memory = payload["payload"]["memory"]
        return

    def disass(self):
        """
        Disassembles the current instruction
        """
        if not hasattr(self, "disassembly"):
            os.system(f"objdump -d --adjust-vma {hex(self.entrypoint)} /tmp/microgdb/binary > /tmp/microgdb/disass.txt")
            with open("/tmp/microgdb/disass.txt", "r") as f:
                self.disassembly = f.read()
                self.disassembly = self.disassembly.split("\n")
            os.remove("/tmp/microgdb/disass.txt")

    def custom_command(self, cmd: str):
        """
        Implements custom commands that take priority over gdb commands
        """
        if cmd == "microgdb":
            self.gdb_out += "Help \n"
            cmd = ""
            return True
        return False

    def set_breakpoint(self, address: int) -> int:
        """
        Sets a breakpoint at the given address
        """
        # clears stdout
        self.gdbmi.get_gdb_response(0, False)
        response = self.gdbmi.write(f"-break-insert *{hex(address)}\n")
        return int(response[1]["payload"]["bkpt"]["number"])


    def remove_breakpoint(self, number: int):
        """
        Removes a breakpoint at the given address
        """
        self.gdbmi.write(f"-break-delete {number}\n")


    def get_entrypoint(self):
        """
        Gets the entrypoint of the binary
        """
        # I have to pass by gdb because I can't get it to work in gdbmi

        response = self.gdb.writeThenRead("info file\n")
        self.gdb.writeThenRead("q\n")
        print(response)
        self.entrypoint = int(response.split("Entry point: ")[1].split("\n")[0], 16)

        os.system("readelf -h /tmp/microgdb/binary > /tmp/microgdb/header.txt")

        with open("/tmp/microgdb/header.txt", "r") as f:
            response = f.read()
        os.remove("/tmp/microgdb/header.txt")

        print(response)
        self.entrypoint -= int(response.split("Entry point address: ")[1].split("\n")[0], 16)

        print(self.entrypoint)


    def update_registers(self):
        """
        Updates the values of all the registers
        """
        # clears stdout
        self.gdbmi.get_gdb_response(0, False)
        response = self.gdbmi.write("i r\n")

        print(response)

        self.registers.clear()
        for e in response:
            if e["type"] == "console":
                payload = re.sub(" +", " ", e["payload"][:-2]).split(" ")

                reg_name = payload[0]
                reg_val = payload[1]

                if self._is_ip(reg_name):
                    self.ip = int(reg_val, 16)

                if self._is_sp(reg_name):
                    self.sp = int(reg_val, 16)

                self.registers.append(
                    {
                        "name": reg_name,
                        "val": reg_val,
                        "mem": " ".join(payload[2:]),
                    }
                )

    def update(self):
        """
        Updates the state of the handler after a command
        """
        self.update_registers()

    def run_command(self, cmd: str, clear_history=True):
        """
        Runs a command in the pty and updates the tracked information
        """
        if clear_history:
            self.io_out = ""
            self.gdb_out = ""
        if not self.custom_command(cmd):
            cmd = f"{cmd} \n"
            s = self.gdb.writeThenRead(cmd)
            ind2 = s.rfind('\n')
            self.gdb_out = s[:ind2] + '\n' # removes the prompt and the previous input
            self.prompt = s[ind2 + 1:]

            self.update()

    def startup(self, commands: list):
        """
        Starts the code
        """
        self.prompt = ""
        for command in commands:
            out = self.gdb.writeThenRead(command)
            ind2 = out.rfind('\n')
            self.gdb_out += self.prompt + command + "\n" + out[:ind2] + '\n'
            self.prompt = out[ind2+1:]

        # Gets the entrypoint of the binary
        self.get_entrypoint()

        self.update()

    def run_gdb(self, command):
        """
        Runs gdb and updates the tracked information
        """
        s = self.gdb.writeThenRead(command + "\n")
        ind2 = s.rfind('\n')
        # removes the prompt
        self.gdb_out = s[:ind2]
        self.prompt = s[ind2 + 1:]


    def __init__(self):
        self.gdb = PTYHandler("gdb")

        self.gdb_out = self.gdb.readUntilPrompt()

        # the last program output
        self.io_out = ""

        # the value of all the regsters
        self.registers = []

        # the value of the stack pointer
        self.sp: Optional[int] = None

        # the value of the instruction pointer
        self.ip: Optional[int] = None

        # the value of the memory
        self.memory = []

        # sets a tty to be used for the inferior
        self.pty_inferior: PTYHandler = PTYHandler()

        # sets a tty to be used for the gui
        self.pty_gui: PTYHandler = PTYHandler()

        self.gdb.writeThenRead(f"new-ui mi {self.pty_gui.name}\n")
        self.gdb.writeThenRead(f"set inferior-tty {self.pty_inferior.name}\n")
        # self.gdb.writeThenRead(f"set pagination off\n")
        # self.gdb.writeThenRead(f"set width 32\n")
        # self.gdb.writeThenRead(f"set height unlimited\n")

        self.gdbmi = IoManager(
            os.fdopen(self.pty_gui.master, "wb", buffering=0),
            os.fdopen(self.pty_gui.master, "rb", buffering=0),
            None,
        )

        # starts the code
        self.startup(["file /tmp/microgdb/binary\n", "starti\n"])
