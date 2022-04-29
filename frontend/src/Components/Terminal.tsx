import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { black } from "../utils";

const useStyles = createUseStyles({
  input: {
    paddingLeft: (props: {
      prompt_txt: string;
      default_height: string;
      input_disabled: boolean;
    }) => `${props.prompt_txt.length}ch`,
    marginLeft: (props) => `-${props.prompt_txt.length}ch`,
    width: "100%",
    outline: "none",
    fontFamily: "Fira Code, Menlo, Monaco, Consolas, Courier New, monospace",
    fontSize: ".875em",
    color: black,
  },
  prompt: {
    right: "-3px",
    position: "relative",
    opacity: "0.75",
    fontFamily: "Fira Code, Menlo, Monaco, Consolas, Courier New, monospace",
    fontSize: ".875em",
    color: black,
  },
  container: {
    height: (props) => props.default_height,
    overflowY: "scroll",
    overflowX: "hidden",
    resize: "vertical",
  },
  code: {
    lineBreak: "anywhere",
    display: "block",
    margin: "10px",
    fontFamily: "Fira Code, Menlo, Monaco, Consolas, Courier New, monospace",
    color: "#fff",
  },
  input_container: {
    display: (props) => (props.input_disabled ? "none" : "block"),
    padding: {
      top: "0px",
      left: "10px",
      right: "10px",
      bottom: "5px",
    },
  },
});

const Terminal = (props: {
  content: string;
  input_disabled: boolean;
  default_height: string;
  prompt: string;
  on_input: (input: string) => void;
}) => {
  const [commandHistory, setCommandHistory] = useState([
    "file binary",
    "starti",
  ]);
  const [historyIdx, setHistoryIdx] = useState(commandHistory.length);
  const [input, setInput] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);

  const classes = useStyles({
    default_height: props.default_height,
    prompt_txt: props.prompt,
    input_disabled: props.input_disabled,
    theme: "default",
  });

  const scrollToBottom = () => {
    if (messagesEnd.current) {
      messagesEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [props.content]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    switch (e.key) {
      case "Enter":
        if (input.length > 0) {
          setCommandHistory([...commandHistory, input]);
          setHistoryIdx(historyIdx + 1);
          props.on_input(input);
          setInput("");
        }
        break;
      case "ArrowUp":
        if (historyIdx > 0) {
          setHistoryIdx(historyIdx - 1);
          setInput(commandHistory[historyIdx - 1]);
        }
        break;
      case "ArrowDown":
        if (historyIdx < commandHistory.length) {
          setHistoryIdx(historyIdx + 1);
          setInput(commandHistory[historyIdx + 1]);
        }
        break;
      default:
        break;
    }
  };

  return (
    <>
      <code className={classes.code}>
        <div className={classes.container}>
          <pre>{props.content}</pre>
          <div style={{ float: "left", clear: "both" }} ref={messagesEnd} />
        </div>
      </code>
      <div className={classes.input_container}>
        <span className={classes.prompt}>{props.prompt}</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className={classes.input}
          autoComplete="false"
          spellCheck={false}
          disabled={props.input_disabled}
        />
      </div>
    </>
  );
};

Terminal.defaultProps = {
  content: "",
  input_disabled: false,
  default_height: "360px",
  on_input: (input: string) => {},
};

export default Terminal;
