import "./Spinner.css";

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading Repositories...</p>
    </div>
  );
}

export default Spinner;