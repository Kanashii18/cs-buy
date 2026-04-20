// AlertDialog.jsx
import { useState, useEffect } from 'react';
import { resolveAlert } from './alertbox.js';
import "./alert.css";

export function AlertDialog() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [color, setcolor] = useState("#d7cae2ff")
  const [buttonLabel, setButtonLabel] = useState('Confirm');

  useEffect(() => {
    function onOpenAlert(e) {
      setMessage(e.detail.message);
      setButtonLabel(e.detail.buttonText);
      setcolor(e.detail.color);
      setVisible(true);
    }

    window.addEventListener('open-alert', onOpenAlert);
    return () => window.removeEventListener('open-alert', onOpenAlert);
  }, []);

  function handleClose(value) {
    setVisible(false);
    resolveAlert(value);
  }

  if (!visible) return null;

  return (
    <div onClick={() => handleClose(false)} className="delete_alert-verify text-white/85">
      <div className="delete-alert">
        <div onClick={() => handleClose(false)} className="goback-option">
          <img src="../assets/icons/canceled.svg" alt="cancel action" />
        </div>
        <div className="alert_text-value">{message}</div>
        <div onClick={() => handleClose(true)} className="summit_alert" style={{backgroundColor:color}}>
          {buttonLabel}
        </div>
      </div>
    </div>
  );
}
