import { useState } from 'react';

const EmailPopup = ({ emailContent, onClose, candidateEmail }) => {
  const [emailCopied, setEmailCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);

  const copyEmail = () => {
    if (candidateEmail) {
      navigator.clipboard.writeText(candidateEmail);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(emailContent);
    setMessageCopied(true);
    setTimeout(() => setMessageCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '2.5rem',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      width: '90%',
      maxWidth: '600px',
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          background: '#f8f9fa',
          padding: '1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ 
              fontSize: '0.9rem', 
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600'
            }}>
              Student Email
            </span>
            <button
              onClick={copyEmail}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: emailCopied ? '#4CAF50' : '#00BF63',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {emailCopied ? '✓ Copied!' : 'Copy Email'}
            </button>
          </div>
          <div style={{ 
            fontSize: '1.1rem',
            color: '#333',
            fontWeight: '500'
          }}>
            {candidateEmail}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <span style={{ 
              fontSize: '0.9rem', 
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600'
            }}>
              Email Message
            </span>
            <button
              onClick={copyMessage}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: messageCopied ? '#4CAF50' : '#00BF63',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {messageCopied ? '✓ Copied!' : 'Copy Message'}
            </button>
          </div>
          <textarea
            value={emailContent}
            readOnly
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              fontSize: '1rem',
              lineHeight: '1.5',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#333',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1rem',
          transition: 'all 0.2s ease',
          width: '100%'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#444';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#333';
        }}
      >
        Close
      </button>
    </div>
  );
};

export default EmailPopup; 