import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function BackBar({ title, to = -1, right = null }) {
  const navigate = useNavigate();

  const goBack = () => {
    if (typeof to === 'number') return navigate(to);
    return navigate(to);
  };

  return (
    <div className="backbar">
      <button type="button" className="back-btn" onClick={goBack}>
        <FaArrowLeft />
        <span>Volver</span>
      </button>
      <h2 className="backbar-title">{title}</h2>
      <div className="backbar-right">{right}</div>
    </div>
  );
}
