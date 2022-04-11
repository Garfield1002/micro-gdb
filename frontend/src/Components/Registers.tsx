import { createUseStyles } from "react-jss";
import { Container, Row, Col } from "react-bootstrap";
import { register } from "../utils";

const useStyles = createUseStyles({
  mono: {
    fontFamily: "Fira Code, Menlo, Monaco, Consolas, Courier New, monospace",
    margin: 0,
    fontSize: "0.8em",
  },
  regTable: {
    alignItems: "center",
    tableLayout: "fixed",
  },
  regVal: {
    textAlign: "left",
    minWidth: "10ch",
  },
  regName: {
    paddingRight: "50px !important",
    textAlign: "left",
  },
});

const Registers = (props: { registers: register[] }) => {
  const classes = useStyles();
  return (
    <div>
      <Row>
        {props.registers.map((reg, i) => (
          <Col key={i}>
            <table className={classes.regTable}>
              <tbody>
                <tr>
                  <td className={classes.regName}>
                    <small>
                      <pre>{reg.name.padEnd(6, " ")}</pre>
                    </small>
                  </td>
                  <td className={classes.regVal}>
                    <small
                      className={classes.mono}
                      data-toggle="tooltip"
                      data-placement="top"
                      title={reg.mem}
                    >
                      {reg.val}
                    </small>
                  </td>
                </tr>
              </tbody>
            </table>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Registers;
