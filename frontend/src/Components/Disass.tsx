import { useState } from "react";
import { createUseStyles } from "react-jss";
import { yellow } from "../utils";

const useStyles = createUseStyles({
  container: {
    height: (props: { default_height: string }) => props.default_height,
    overflowY: "scroll",
    resize: "vertical",
    overflowX: "visible",
  },
  code: {
    lineBreak: "anywhere",
    display: "block",
    margin: "10px",
    fontFamily: "Fira Code, Menlo, Monaco, Consolas, Courier New, monospace",
    color: "#fff",
    cursor: "pointer",
  },
  line: {
    padding: {
      top: "4px",
      bottom: "4px",
      left: "20px",
    },
    display: "flex",
    alignItems: "center",
    overflow: "visible",
  },

  inst: {
    "&:hover": {
      backgroundColor: yellow,
    },
  },

  ball: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "red",
    marginRight: "5px",
    marginLeft: "-15px",
    display: "inline-block",
    zIndex: "1",
  },

  pc: {
    color: "red",
  },
});

const Instr = (props: {
  inst: string;
  entrypoint: number;
  lineNumber: number;
  pc: number;
}) => {
  const classes = useStyles({
    default_height: "100px",
    theme: "default",
  });

  const [breakPointNumber, setBreakPointNumber] = useState<number | null>(null);

  return (
    <div
      className={`${classes.line} ${classes.inst} ${
        props.lineNumber === props.pc ? classes.pc : ""
      }`}
      onClick={(e) => {
        if (!breakPointNumber) {
          fetch(`http://localhost:5000/set_breakpoint`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: props.lineNumber,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              setBreakPointNumber(data.number);
            });
        } else {
          fetch(`http://localhost:5000/remove_breakpoint`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              number: breakPointNumber,
            }),
          }).then((_) => {
            setBreakPointNumber(null);
          });
        }
      }}
    >
      {breakPointNumber ? <div className={classes.ball} /> : null}
      <pre>{props.inst}</pre>
    </div>
  );
};

const Disass = (props: {
  disass: string[];
  entrypoint: number;
  pc: number;
}) => {
  const classes = useStyles({
    default_height: "500px",
    theme: "default",
  });
  return (
    <code className={classes.code}>
      <div className={classes.container}>
        {props.disass.map((line, i) => {
          // if the line is an instruction sets the line number and make it hoverable
          // 1000:	53                   	push   %ebx

          var lineNumberStr = line.match(/^\s*([0-9a-fA-F]+):\t.*$/);

          if (lineNumberStr) {
            let lineNumber = parseInt(lineNumberStr[1], 16);

            return (
              <Instr
                key={i}
                inst={line}
                lineNumber={lineNumber}
                entrypoint={props.entrypoint}
                pc={props.pc}
              />
            );
          }

          return (
            <div key={i} className={classes.line}>
              <pre>{line}</pre>
            </div>
          );
        })}
      </div>
    </code>
  );
};

export default Disass;
