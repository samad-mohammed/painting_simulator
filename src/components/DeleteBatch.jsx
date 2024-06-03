import React, { useState, useEffect } from "react";
import axios from "axios";
import { message, Divider } from "antd";

const DeleteBatch = ({ apiUrl }) => {
  const [batchSummary, setBatchSummary] = useState([]);
  const [batchNumber, setBatchNumber] = useState("");
  const [deleteBatchNumber, setDeleteBatchNumber] = useState("");
  const [armyId, setArmyId] = useState("");
  const  key = 'updatable';
  useEffect(() => {
    fetchBatchSummary();
  }, []);

  const fetchBatchSummary = async () => {
    try {
      const response = await axios.get(`${apiUrl}/batch_summary`);
      if (response.status === 200) {
        setBatchSummary(response.data);
      }
    } catch (error) {
      console.error("Error fetching batch summary:", error);
    }
  };

  const handleDeleteByBatch = async () => {
    try {
      message.open({ 
        type:'loading',
        content: "Deleting Batch...",
        key
       });

      const response = await axios.post(`${apiUrl}/delete_students_by_batch`, {
        deleteBatchNumber,
      });

      if (response.status === 200) {
        message.open({
          type:'success',
          content: `Batch : ${deleteBatchNumber} removed successfully`,
          duration: 2,
          key
        });
        
        fetchBatchSummary(); // Refresh batch summary after deletion
        setDeleteBatchNumber("")

      }
    } catch (error) {
      message.open({
        type:'error',
        content: `Error deleting batch : ${deleteBatchNumber}`,
        duration: 2,
        key
      });
    }
  };

  const removeStudent = async () => {
    try {      message.open({ 
      type:'loading',
      content: "Removing...",
      key
     });

      const response = await axios.post(`${apiUrl}/remove_student`, {
        armyId,
        batchNumber,
      });

      if (response.status === 200) {
        message.open({
          type:'success',
          content: `${armyId} of batch ${batchNumber} removed successfully`,
          duration: 3,
          key
        });

        fetchBatchSummary(); // Refresh batch summary after deletion
        setArmyId("")
        setBatchNumber("")
      }
    } catch (error) {
      message.open({
        type:'error',
        content: `Error deleting Student: "${armyId}" of batch: "${batchNumber}"`,
        duration: 3,
        key
      });
    }
  };

  const isButtonDisabled = !armyId || !batchNumber;
  const isBtnDisabled = !deleteBatchNumber;

  return (
    <div className="container">
      <h2 className="heading mb-3 underline">Batch details</h2>
      <table>
        <thead>
          <tr>
            <th>Batch Number</th>
            <th>Student Count</th>
          </tr>
        </thead>
        <tbody>
          {batchSummary.map((batch, index) => (
            <tr key={index}>
              <td>{batch[0]}</td>
              <td>{batch[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Divider />
      <div className="uploadContainer">
        <div className="underline" style={{ textAlign: "center" }}>
          <h2 className="heading mb-3">Remove Student</h2>
          <div className="formContainer" style={{ maxWidth: "650px" }}>
            <label htmlFor="armyId">Army ID:</label>
            <input
              type="text"
              id="armyId"
              value={armyId}
              onChange={(e) => setArmyId(e.target.value)}
              style={{ border: "1px solid black", textAlign: "center" }}
              placeholder="Enter Army ID"
            />
            <label htmlFor="batchNumber">Batch Number:</label>
            <input
              type="text"
              id="batchNumber"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              style={{ border: "1px solid black", textAlign: "center" }}
              placeholder="Enter Batch Number"
            />
            <button
              onClick={removeStudent}
              disabled={isButtonDisabled}
              style={{
                backgroundColor: "#bf0000",
                color: "#fff",
                fontSize: "12px",
                padding: "10px 45px",
                border: "1px solid transparent",
                borderRadius: "8px",
                fontWeight: "600",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginTop: "10px",
                cursor: "pointer",
              }}
            >
              Remove Student
            </button>
          </div>
        </div>
        <Divider />
        <div className="container mt-2 row align-items-center justify-content-center mb-5">
          <h2 className="heading mb-3 underline">Delete students by batch</h2>
          <div className="" c>
            <label>Batch Number</label>
            <input
              type="text"
              value={deleteBatchNumber}
              onChange={(e) => setDeleteBatchNumber(e.target.value)}
              placeholder="Enter Batch Number"
              style={{ border: "1px solid black", textAlign: "center" }}
            />
            <button
              onClick={handleDeleteByBatch}
              disabled={isBtnDisabled}
              style={{
                backgroundColor: "#bf0000",
                color: "#fff",
                fontSize: "12px",
                padding: "10px 45px",
                border: "1px solid transparent",
                borderRadius: "8px",
                fontWeight: "600",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginTop: "10px",
                cursor: "pointer",
                
              }}
            >
              Delete Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteBatch;
