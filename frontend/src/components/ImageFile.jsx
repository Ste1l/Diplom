import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';

const ImageFile = ({ onFileSelected }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
  
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedFile(file);
        onFileSelected(file);
      } else {
        setSelectedFile(null);
        onFileSelected(null);
      }
    };
  
    return (
      <div>
        <input type='file' onChange={handleFileChange} />
        {error && <div style={{color: 'red'}}>{error}</div>}
        {selectedFile && <div>Выбрано изображение: {selectedFile.name}</div>}
      </div>
    );
  };

export default ImageFile;
