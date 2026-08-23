import "./ErrorMessage.css";

function ErrorMessage({ message, retry }) {

  return (

    <div className="error-box">

      <h2>Something went wrong</h2>

      <p>{message}</p>

      <button onClick={retry}>
        Retry
      </button>

    </div>

  );

}

export default ErrorMessage;