import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import { Card } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentApp = ({ apiUrl }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = () => {
    fetch(`${apiUrl}/get-files`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.files) {
          setFiles(data.files);
        } else {
          console.error("Invalid response format:", data);
        }
      })
      .catch((error) => console.error("Error fetching files:", error));
  };

  const openFileInModal = (fileId) => {
    fetch(`${apiUrl}/get-file/${fileId}`)
      .then((response) => response.blob())
      .then((blob) => {
        setSelectedFile(URL.createObjectURL(blob));
        setModalVisible(true);
      })
      .catch((error) => console.error("Error fetching file:", error));
  };

  const handleModalClose = () => {
    setSelectedFile(null);
    setModalVisible(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 
      className="heading underline" style={{marginBottom:'0px'}}>
        Books
      </h1>
      {files.length === 0 ? (
        <h2 style={{ textAlign: "center" }}>No books available</h2>
      ) : (
        <div className="container">
          <div className="row">
            {files.map((file) => (
              <div key={file.id} className="col-md-3 col-sm-6 col-xs-12 mb-4">
                <Card style={{ width: "100%" }}>
                  <Card.Img
                    variant="top"
                    src="file_icon.png"
                    style={{ width: "60%", margin: "0 auto" }}
                  />
                  <Card.Body>
                    <Card.Title>{file.book_name}</Card.Title>
                    <Card.Text>Uploaded by: {file.instructor_name}</Card.Text>
                    <Button onClick={() => openFileInModal(file.id)}>Open</Button>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
      <Modal
        title="File Preview"
        open={modalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
        width="80%"
        centered
      >
        <iframe
          title="File Preview"
          src={selectedFile}
          style={{ width: "100%", height: "80vh", border: "none" }}
        ></iframe>
      </Modal>
    </div>
  );
};

export default StudentApp;
