import React, { useState } from "react";
import { message, Divider } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import reqwest from "reqwest";

const UploadBook = ({ notify, apiUrl }) => {
  const [instructorName, setInstructorName] = useState("");
  const [bookName, setBookName] = useState("");
  const [file, setFile] = useState(null);

  const onFinish = async (e) => {
    e.preventDefault();
    const key = "updatable"; // Define a custom key for the message

    try {
      // Display a loading message while uploading
      message.loading({ content: "Uploading file...", key });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("instructorName", instructorName);
      formData.append("bookName", bookName);

      const response = await reqwest({
        url: `${apiUrl}/upload-file`,
        method: "post",
        processData: false,
        data: formData,
      });

      // If upload is successful
      if (response && response.message === "File uploaded successfully") {
        // Display success message
        message.success({
          content: `${bookName} added to the books.`,
          key,
          duration: 2,
        });

        // Reload the page after a delay
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } else {
        // Display error message if upload failed
        message.error({
          content: "Error uploading file. Please try again.",
          key,
          duration: 2,
        });
      }
    } catch (error) {
      // Display error message if an exception occurs
      message.error({
        content: "Error uploading file. Please try again.",
        key,
        duration: 2,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  return (
    <div className="uploadContainer underline">
      <h1 className="heading mt-5 mb-3" style={{  }}>
        Upload a Book <small>(.pdf)</small>{" "}
      </h1>
      <div className="m-4" style={{ width: "510px" }}>
        <form
          onSubmit={onFinish}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <label htmlFor="instructorName">Instructor Name:</label>
          <input
            type="text"
            id="instructorName"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            required
            style={{ border: "2px solid black" }}
          />

          <label htmlFor="bookName">Book Name:</label>
          <input
            type="text"
            id="bookName"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            required
            style={{ border: "2px solid black" }}
          />

          <label htmlFor="file">File:</label>
          <input
            type="file"
            id="file"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />

          <button
            type="submit"
            disabled={!instructorName || !bookName || !file}
            style={{
              marginTop: "10px",
              cursor:
                !instructorName || !bookName || !file
                  ? "not-allowed"
                  : "pointer",
              backgroundColor:
                !instructorName || !bookName || !file ? "#ccc" : "#512da8",
              color: !instructorName || !bookName || !file ? "#888" : "#fff",
              border: "1px solid transparent",
              borderRadius: "8px",
              fontSize: "12px",
              padding: "10px 45px",
              fontWeight: "600",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              outline: "none",
              textDecoration:"none"
            }}
          >
            Submit File
          </button>
        </form>
      </div>
      <Divider />
    </div>
  );
};

export default UploadBook;
