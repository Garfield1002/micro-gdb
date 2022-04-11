import React, { useEffect, useState } from "react";
import "./App.css";

import { createUseStyles } from "react-jss";
import { Container, Row, Col } from "react-bootstrap";
import { blue, register, yellow } from "./utils";
import Registers from "./Components/Registers";
import Terminal from "./Components/Terminal";
import Memory from "./Components/Memory";
import { memory } from "./utils/types";

const useStyles = createUseStyles({
  box: ({ color }: { color: string }) => ({
    border: `2px solid ${color}`,
    padding: 0,
    margin: "1em 0em 0em 0em",
    borderRadius: "0.2em",
  }),
  title: ({ color }: { color: string }) => ({
    display: "block",
    backgroundColor: color,
    padding: "5px",
    textAlign: "left",
    fontFamily: "arial",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#26343e",
    margin: 0,
    borderRadius: "0.1em 0.1em 0 0",
  }),
  content: {
    flex: 1,
    padding: "10px",
    color: "#fff",
  },
});

const Box = (props: {
  name: string;
  color: string;
  tooltip: string;
  children: React.ReactNode;
}) => {
  const classes = useStyles({ color: props.color });
  return (
    <Row className={classes.box}>
      <h1
        className={classes.title}
        data-toggle="tooltip"
        data-placement="top"
        title={props.tooltip}
      >
        {props.name}
      </h1>
      <div className={classes.content}>{props.children}</div>
    </Row>
  );
};

function App() {
  const [ioHistory, setIOHistory] = useState("");
  const [gdbHistory, setGdbHistory] = useState("");
  const [sp, setSP] = useState(0);
  const [memory, setMemory] = useState<memory[]>([]);
  const [registers, setRegisters] = useState<register[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/update")
      .then((res) => res.json())
      .then((res) => {
        setGdbHistory((g) => g + res.gdb_out);
        setRegisters(res.registers);
        setIOHistory((i) => i + res.io_out);
        setSP(res.sp);
        setMemory(res.memory);
      });
  }, []);

  const onGdbInput = (input: string) => {
    setGdbHistory((g) => g + `(gdb) ${input}\n`);
    fetch("http://127.0.0.1:5000/update", {
      method: "POST",
      headers: {
        "CORS-Anywhere": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gdb_input: input }),
    })
      .then((res) => res.json())
      .then((res) => {
        setGdbHistory((g) => g + res.gdb_out);
        setRegisters(res.registers);
        setIOHistory((i) => i + res.io_out);
        setSP(res.sp);
        setMemory(res.memory);
      });
  };

  // const s =
  //   "Welcome to the lock debugger.\nYou are connected to a lock you managed to procure. You have\n  enabled the JTAG headers. This is not the real door lock.\n  Use this mode to figure out what the lock is doing, and\n  then leave the debugger (upper left button) and enter\n  your input on the actual lock.\nIf you're not  sure what to do with this  interface, typing\n  'help' would be a good start.\nIf you just want to see things work, type 'continue'.\n\nConnecting to remote lock ...\nConnected. Have fun!\n\n\n> run\n   Unknown Command.\n> step\n> step\n> step\n> step\n\n> step\n> step\n> step\n> step\n\n> step\n> step\n> step\n> step\n";
  return (
    <Container className="App">
      <Row>
        <Col>
          <Box name="Disassembly" color={blue} tooltip="">
            <p>pc 4400</p>
          </Box>
          <Box name="Live Memory Dump" color={yellow} tooltip="">
            <Memory mem={memory} sp={sp} />
          </Box>
        </Col>
        <Col>
          <Box
            name="Register State"
            color={yellow}
            tooltip="The output of info registers"
          >
            <Registers registers={registers} />
          </Box>

          {/* <Box name="Current Instruction" color={yellow} tooltip="">
            <p>pc 4400</p>
          </Box> */}

          <Box name="GDB Console" color={blue} tooltip="">
            <Terminal content={gdbHistory} on_input={onGdbInput} />
          </Box>
          <Box name="I/O Console" color={blue} tooltip="">
            <Terminal
              content={ioHistory}
              input_disabled
              default_height="auto"
            />
          </Box>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
