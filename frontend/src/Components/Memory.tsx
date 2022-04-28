import { createUseStyles } from "react-jss";
import { blue, memory } from "../utils";

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
    marginRight: "1.5ch",
    marginLeft: "0.5ch",
  },
  byte: {
    marginRight: "0.5ch",
  },
  ascii: {
    fontVariantLigatures: "none",
    marginLeft: "1.5ch",
    marginRight: "0.5ch",
  },
  line: {
    padding: {
      top: "4px",
      bottom: "4px",
    },
    display: "flex",
    width: "100%",
    justifyContent: "space-between",

    "&:hover": {
      backgroundColor: blue,
    },
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
        {props.mem.map(({ addr, data, ascii }, i) => {
          let addrNumber: number = parseInt(addr, 16);
          return (
            <div key={i} className={classes.line}>
              <span className={classes.addr}>{`${addr}:`}</span>
              <span>
                {data.map((byte0x, j) => {
                  let byte = byte0x.slice(2);
                  return (
                    <span key={j} className={classes.byte}>
                      <span
                        style={
                          addrNumber + 2 * j === props.sp
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
                          addrNumber + 2 * j + 1 === props.sp
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
                  );
                })}
              </span>
              <span className={classes.ascii}>{ascii}</span>
            </div>
          );
        })}
      </div>
    </code>
  );
};

export default Memory;
