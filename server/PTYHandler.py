import os
import pty
import re
from select import select
import sys
from typing import Optional


class PTYHandler:

    _MAX_READ_SIZE = 4096

    def __init__(self, cmd=None, echo=False) -> None:
        if cmd:
            child_pid, master = pty.fork()
            if child_pid == 0:
                # child process
                try:
                    os.execvp("bash", ["bash"])
                except Exception as e:
                    print("Error")
                    print(e)
                    sys.stdout.flush()
                    sys.exit(1)
            else:
                self.master = master
                self.readUntilPrompt()
                if not echo:
                    self.writeThenRead("stty -echo\n")
                self.write(f"{cmd}\n")

        else:
            (self.master, slave) = pty.openpty()
            self.name = os.ttyname(slave)

    def read(self) -> Optional[str]:
        """
        Reads data from the pseudo terminal
        """
        if self.master is None:
            return "done;"

        rlist, _, _ = select([self.master], [], [], 1)

        # read data
        if rlist:
            try:
                data = os.read(self.master, self._MAX_READ_SIZE)
                return data.decode()
            except OSError:
                return None
        else:
            print("ERROR: TIMEOUT")
            return "TIMEOUT\n"

    def readUntilPrompt (self) -> Optional[str]:
        """
        Reads data from the pseudo terminal until gdb is found
        """
        data = ""
        while True:
            new = self.read()
            if new is None:
                return None
            if not re.search(r"((^[ \t]*)|[\n\r]|\.\.\.)$", new):
                return data + new
            data += new

    def write(self, command: str) -> None:
        """
        Sends a command to the pseudo terminal
        """
        data = command.encode()
        os.write(self.master, data)

    def writeThenRead(self, command: str) -> Optional[str]:
        """
        Sends a command to the pseudo terminal and reads the response
        """
        self.write(command)
        return self.readUntilPrompt()

