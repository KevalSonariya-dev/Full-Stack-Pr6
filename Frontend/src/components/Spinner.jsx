import "./Spinner.css";

function Spinner({ message = "Loading page..." }) {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default Spinner;