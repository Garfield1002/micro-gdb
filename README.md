# μ-gdg

> ⚠ μ-gdg is still in a development phase and still has many bugs as well as vulnerabilities.
Feel free to leave some feedback or contribute to this project.

Micro gdb is a minimalist gdb frontent inspired by microcoruption's interface.

![Screenshot MicroGDB](https://user-images.githubusercontent.com/53104608/165972546-df7c1e62-9129-4df5-855e-8942ad6ca560.png)

## 🧪 Technologies

Micro gdb is built using a flask server with a React applicaton.

The flask server relies heavily on [pygdbmi](https://github.com/cs01/pygdbmi).

## ⚙ Usage

Install requirements with

```bash
pip3 install -r requirements.txt
```

You can then start the server by running

```bash
python3 ./server/ hello.c
```

The server can be started with either a C file or a binary.

Micro gdb will then be accessible at [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

## 🛣 Roadmap

As mentioned earlier, micro gdb is in an early stage of development. I am  currently working on implementing various features

- Support for the IO terminal for interacting with the inferior

- Better terminal outputs (there is currently a bug where the terminal can get "stuck" in the middle of an output)

- Editable fields for the registers as well as the memory

- Suppot for cross compilation and RiscV (I need this for a school project)

## ⚖ License

This code is placed under the MIT Liscence.

