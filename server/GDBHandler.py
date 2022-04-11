from pygdbmi.gdbcontroller import GdbController
import re
import os
from Singleton import Singleton


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
            self.sp = 4294955232

        self.memory.clear()

        # The bounds of the memory dump
        start, length = self.sp - 128, 256

        # TODO align memory

        cwd = os.getcwd()

        response = self.gdbmi.write(f"-data-read-memory-bytes {start} {length}")

        # self.gdbmi.write(f"dump binary memory {cwd}/server/temp/dump.bin {start} {end}")
        # os.popen(f'xxd -o {start} {cwd}/server/temp/dump.bin')
        # responses = self.gdbmi.write(
        #     f'eval "shell xxd -o %ld {cwd}/server/temp/dump.bin", {start}'
        # )

        payload = response[0]

        if payload["message"] != "done":
            return

        mem = payload["payload"]["memory"][0]["contents"]

        # If x is a printable ascii character, then return the character otherwise return a dot
        printableChr = (
            lambda x: chr(int(x, 16)) if int(x, 16) in range(32, 127) else "."
        )

        for i in range(0, len(mem), 32):
            self.memory.append(
                {
                    "addr": start + i // 2,
                    "bytes": ["".join(mem[n : n + 4]) for n in range(i, i + 32, 4)],
                    "ascii": "".join(
                        printableChr("".join(mem[n : n + 2]))
                        for n in range(i, i + 32, 2)
                    ),
                }
            )
        return

        for response in responses:
            if response["type"] == "output":
                # {'type': 'output', 'message': None, 'payload': 'ffffd018: 0100 0000 0000 0000 42e5 ffff ff7f 0000  ........B.......', 'stream': 'stdout'}
                payload: str = response["payload"]
                payloads = payload.split(" ")
                self.memory.append(
                    {
                        "addr": int(payloads[0][:-1], 16),
                        "bytes": payloads[1:9],
                        "ascii": payload[-16:],
                    }
                )

    def custom_command(self, cmd: str):
        """
        Implements custom commands that take priority over gdb commands
        """
        if cmd == "microgdb":
            self.gdb_out += "Help \n"
            cmd = ""
            return True
        return False

    def update_registers(self):
        """
        Updates the values of all the registers
        """
        response = self.gdbmi.write("i r")
        self.registers.clear()
        for e in response:
            if e["type"] == "console":
                payload = re.sub(" +", " ", e["payload"][:-2]).split(" ")

                reg_name = payload[0]
                reg_val = payload[1]

                # if self._is_ip(reg_name):
                #     self.ip = int(reg_val, 16)

                # if self._is_sp(reg_name):
                #     self.sp = int(reg_val, 16)

                self.registers.append(
                    {
                        "name": reg_name,
                        "val": reg_val,
                        "mem": " ".join(payload[2:]),
                    }
                )

    def add_response_to_history(self, response):
        """
        Adds the command and it's response to the history
        """
        for e in response:
            if e["stream"] == "stdout" and type(e["payload"]) == str:
                payload: str = e["payload"]
                # TODO all double escaped chars
                payload = (
                    payload.replace("\\n", "\n")
                    .replace('\\"', '"')
                    .replace("\\'", "'")
                    .replace("\\t", "\t")
                    .replace("\\r", "\r")
                )
                if e["type"] == "log":
                    pass
                elif e["type"] == "output":
                    self.io_out += payload
                else:
                    self.gdb_out += payload

    def update(self, response):
        """
        Updates the state of the handler after a command
        """
        self.add_response_to_history(response)
        self.update_registers()
        self.update_memory()

    def run_command(self, cmd: str):
        """
        Runs a command and updates the tracked information
        """
        self.io_out = ""
        self.gdb_out = ""
        if not self.custom_command(cmd):
            response = self.gdbmi.write(cmd)
            self.update(response)

    def __init__(self):
        self.gdbmi = GdbController()

        # the last gdb command output
        self.gdb_out = ""

        # the last program output
        self.io_out = ""

        # the value of all the regsters
        self.registers = []

        # the value of the stack pointer
        self.sp = None

        # the value of the instruction pointer
        self.ip = None

        # the value of the memory
        self.memory = []

        # starts the code
        self.run_command("file ./server/temp/binary")
        self.run_command("starti")
