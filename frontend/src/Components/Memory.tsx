import { createUseStyles } from "react-jss";
import { memory } from "../utils/types";

const useStyles = createUseStyles({
  container: {
    height: (props: { default_height: string }) => props.default_height,
    overflowY: "scroll",
    overflowX: "hidden",
    resize: "vertical",
  },
  code: {
    lineBreak: "anywhere",
    display: "block",
    margin: "10px",
    fontFamily: "Fira Code, Menlo, Monaco, Consolas, Courier New, monospace",
    fontSize: "12px",
    color: "#fff",
  },
  addr: {
    marginRight: "3ch",
  },
  byte: {
    marginRight: "1ch",
  },
  ascii: {
    fontVariantLigatures: "none",
    marginLeft: "2ch",
  },
});

const Memory = (props: { mem: memory[]; sp: number }) => {
  const classes = useStyles({
    default_height: "100px",
    theme: "default",
  });
  return (
    <code className={classes.code}>
      <div className={classes.container}>
        {props.mem.map(({ addr, bytes, ascii }, i) => (
          <div key={i}>
            <span className={classes.addr}>{`0x${addr.toString(16)}:`}</span>
            {bytes.map((byte, j) => (
              <span key={j} className={classes.byte}>
                <span
                  style={
                    addr + 2 * j === props.sp
                      ? {
                          border: "1px",
                          borderColor: "red",
                          borderStyle: "dashed",
                        }
                      : {}
                  }
                >
                  {byte.slice(0, 2)}
                </span>
                <span
                  style={
                    addr + 2 * j + 1 === props.sp
                      ? {
                          border: "1px",
                          borderColor: "red",
                          borderStyle: "dashed",
                        }
                      : {}
                  }
                >
                  {byte.slice(2)}
                </span>
              </span>
            ))}
            <span className={classes.ascii}>{ascii}</span>
          </div>
        ))}
      </div>
    </code>
  );
};

export default Memory;
