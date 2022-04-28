import os
from sys import argv
import webbrowser

from app import app

HOST = "127.0.0.1"
PORT = "5000"


def run():
    """
    Runs the server
    """

    try:
        print("Starting μ-gdb server...")
        print(f"http://{HOST}:{PORT}")
        print("To stop the server, press Ctrl+C")

        webbrowser.open(f"http://{HOST}:{PORT}")

        app.run(host=HOST, port=PORT)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    if len(argv) != 2:
        print("Error")

    binary_path = argv[1]

    # tests if the given binary_path exists
    if not os.path.exists(binary_path):
        print("Error")

    if not os.path.exists("/tmp/microgdb"):
        os.mkdir("/tmp/microgdb")
    else:
        os.system(f"rm -rf /tmp/microgdb/*")

    os.system(f"cp {binary_path} /tmp/microgdb/")

    # get the path of the copied file
    binary_path = os.path.join(f"/tmp/microgdb/", os.path.basename(binary_path))

    # if the file is c and not yet a binary compiles it into a 32bit binary
    if binary_path.endswith(".c"):
        os.system(f"gcc {binary_path} -o /tmp/microgdb/binary -m32")
    else:
        os.system(f"mv {binary_path} /tmp/microgdb/binary")

    run()

    # print("Starting the flask serer...")
    # os.system("env FLASK_APP=app.py flask run")
    # print("Stopped the flask serer...")
