from flask import Flask, Response, render_template, jsonify, request
from GDBHandler import GDBHandler

app = Flask(
    __name__,
    static_url_path="",
    static_folder="templates",
    template_folder="templates",
)


def add_cors(response):
    """
    Adds cors headers to the response
    """
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    response.headers.add(
        "Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Cors-Anywhere"
    )
    return response


@app.route("/update", methods=["GET", "POST", "OPTIONS"])
def update():
    handler = GDBHandler()

    if request.method == "POST":
        # print(request.json)
        gdb_input = request.json["gdb_input"]
        handler.run_command(gdb_input)
    elif request.method == "OPTIONS":
        return add_cors(Response())

    response = jsonify(
        {
            "gdb_out": handler.gdb_out,
            "registers": handler.registers,
            "io_out": handler.io_out,
            "memory": handler.memory,
            "ip": handler.ip,
            "sp": handler.sp,
        }
    )
    return add_cors(response)


@app.route("/", methods=["GET"])
def index():
    GDBHandler()
    return render_template("index.html")
