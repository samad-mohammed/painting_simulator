import React, { useState, useEffect } from "react";
import { Modal,message, Button } from "antd";

const ShowUploads = ({ notify, apiUrl }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    fetch(`${apiUrl}/get-files`)
      .then((response) => response.json())
      .then((data) => {
        // console.log("Response from server:", data);

        if (data && data.files) {
          setFiles(data.files);
        } else {
          console.error("Invalid response format:", data);
        }
      })
      .catch((error) => console.error("Error fetching files:", error));
  }, []);

  const handleDelete = (fileId) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this file?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        fetch(`${apiUrl}/delete-file/${fileId}`, {
          method: "DELETE",
        })
          .then((response) => response.json())
          .then((data) => {
            message.success("File deleted successfully");
            // Update the list of files after a successful delete
            setFiles(files.filter((file) => file.id !== fileId));
          })
          .catch((error) => {
            message.error("Error deleting file");
          });
      },
      onCancel: () => {
        // Do nothing if user cancels
      },
    });
  };
  const openFileInNewTab = (fileId) => {
    fetch(`${apiUrl}/get-file/${fileId}`)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);

        // Open a new tab with the Blob URL
        window.open(blobUrl, "_blank");
      })
      .catch((error) => console.error("Error fetching file:", error));
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
    <div className="container">
      <div className="text-center">
        <table>
          <thead >
            <tr>
              <th>Instructor Name</th>
              <th>Book Name</th>
              <th>View</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <td>{file.instructor_name}</td>
                <td>{file.book_name}</td>
                <td>
                  <button
                    className="btn btn-success"
                    onClick={() => openFileInModal(file.id)}
                  >
                    View
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(file.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
      title="File preview"
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

export default ShowUploads;
