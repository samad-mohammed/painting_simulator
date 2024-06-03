import React, { useState, useEffect } from "react";
import { Modal, Input, Pagination, Divider, Button } from "antd";
import axios from "axios";

const Dashboard = ({ apiUrl }) => {
  const [dataList, setDataList] = useState([]);
  const [todays_dataList, setTodayDataList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchName, setSearchName] = useState(""); // New state for name filter
  const [allPage, setAllPage] = useState(1);
  const [latestPage, setLatestPage] = useState(1);
  const imagesPerPage = 5;
  const [batchSummary, setBatchSummary] = useState([]);

  const fetchBatchSummary = async () => {
    try {
      const response = await axios.get(`${apiUrl}/batches`);
      if (response.status === 200) {
        setBatchSummary(response.data);
      }
    } catch (error) {
      console.error("Error fetching batch summary:", error);
    }
  };

  useEffect(() => {
    fetchBatchSummary();
    // Fetch total number of students
    fetch(`${apiUrl}/get_total_students`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.totalStudents) {
          setTotalStudents(data.totalStudents);
        }
      })
      .catch((error) => {
        console.error("Error fetching total students:", error);
      });

    // Fetch all student activity based on searchName
    const url = `${apiUrl}/get_all_student_activity?name=${searchName}`;
    const url_today = `${apiUrl}/get_latest_student_activity?name=${searchName}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.dataList) {
          setDataList(data.dataList);
          // console.log(data.dataList.length)
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    fetch(url_today)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.dataList) {
          setTodayDataList(data.dataList);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [searchName]);

  const handleImageClick = (imagePath) => {
    setSelectedImage(imagePath);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    // console.log("All Page Changed:", page);
    setAllPage(page);
  };

  const handleLatestPageChange = (page) => {
    // console.log("Latest Page Changed:", page);
    setLatestPage(page);
  };

  const indexOfLastAllResult = allPage * imagesPerPage;
  const indexOfFirstAllResult = indexOfLastAllResult - imagesPerPage;
  const allResults = dataList.slice(indexOfFirstAllResult, indexOfLastAllResult);

  const indexOfLastLatestResult = latestPage * imagesPerPage;
  const indexOfFirstLatestResult = indexOfLastLatestResult - imagesPerPage;
  const todaysResults = todays_dataList.slice(
    indexOfFirstLatestResult,
    indexOfLastLatestResult
  );

  const handlePrintImage = (imageData) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Image</title>
        </head>
        <body>
          <img src="data:image/png;base64,${imageData}" style="max-width: 100%; height: auto;">
          <script>
            setTimeout(() => {
              window.print();
            }, 1000);
          </script>
        </body>
      </html>
    `);
  };

  const [selectedBatch, setSelectedBatch] = useState("");
  const handleBatchFilterChange = (event) => {
    setSelectedBatch(event.target.value);
  };

  const filterStudentsByBatch = (students, batch) => {
    if (!batch) {
      return students; // If no batch is selected, return all students
    }
    return students.filter((student) => student.batch_no === batch);
  };

  const [selectedAllBatch, setSelectedAllBatch] = useState("");
  const handleAllBatchFilterChange = (event) => {
    setSelectedAllBatch(event.target.value);
  };

  const filterAllStudentsByBatch = (students, batch) => {
    if (!batch) {
      return students; // If no batch is selected, return all students
    }
    return students.filter((student) => student.batch_no === batch);
  };

  const selectedBatchStudents = filterStudentsByBatch(todaysResults, selectedBatch);
  const selectedAllBatchStudents = filterAllStudentsByBatch(allResults, selectedAllBatch);

  return (
    <div className="container">
      <h1 className="heading underline" style={{ marginBottom:'1rem' }}>
        Student Performance Dashboard
      </h1>
      <div className="container mt-3 mb-2" style={{ textAlign: "center" }}>
        <Input
          placeholder="Search by Student Name"
          value={searchName}
          onChange={handleSearchChange}
          style={{
            width: "200px",
            margin: "5px",
            border: "2px solid blue",
            marginBottom: "18px",
          }}
        />
      </div>

      <h2 className="">Today's Results</h2>

      {todaysResults.length > 0 && todaysResults[0].imageData !== null ? (
        <>
          <div className="container d-flex">
            <Pagination
              current={latestPage}
              total={todays_dataList.length}
              showTotal={(total) => `Total ${total} results`}
              pageSize={imagesPerPage}
              onChange={handleLatestPageChange}
              style={{ margin: "25px" }}
              showQuickJumper
            />
            <select
              value={selectedBatch}
              onChange={handleBatchFilterChange}
              style={{
                width: "150px",
                height: "32px",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <option value="">All Batches</option>
              {batchSummary.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Army ID</th>
                <th>Batch No.</th>
                <th>Student Name</th>
                <th>Score Card</th>
                <th>Score</th>
                <th>Result</th>
                <th>Print</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {selectedBatchStudents.length > 0 ? (
                selectedBatchStudents.map((data, index) => (
                  <tr key={index}>
                    <td>{indexOfFirstLatestResult + index + 1}</td>
                    <td>{data.myArmyId}</td>
                    <td>{data.batch_no}</td>
                    <td>{data.myName}</td>
                    <td>
                      {data.imageData && (
                        <div>
                          <button
                            className="btn btn-warning"
                            onClick={() => handleImageClick(data.imageData)}
                          >
                            View Image
                          </button>
                        </div>
                      )}
                    </td>
                    <td>{data.score}</td>
                    <td>{data.final_result}</td>
                    <td>
                      <button
                        className="btn btn-info"
                        onClick={() => handlePrintImage(data.imageData)}
                      >
                        Print
                      </button>
                    </td>
                    <td style={{ fontSize: "0.8em" }}>{data.created_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">No Data Found</td>
                </tr>
              )}
            </tbody>
          </table>
         
        </>
      ) : (
        <p>No data available.</p>
      )}
      <Divider />
      <h2 className="">Overall Results</h2>
      {allResults.length > 0 && allResults[0].imageData !== null ? (
        <>
          <div
            className="container d-flex"
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ width: "150px" }}></div>
            <Pagination
              current={allPage}
              total={dataList.length}
              showTotal={(total) => `Total ${total} results`}
              pageSize={imagesPerPage}
              onChange={handlePageChange}
              style={{ margin: "25px" }}
              showQuickJumper
            />
            <select
              value={selectedAllBatch}
              onChange={handleAllBatchFilterChange}
              style={{
                width: "150px",
                height: "32px",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <option value="">All Batches</option>
              {batchSummary.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>
          <table >
            <thead>
              <tr>
                <th>Rank</th>
                <th>Army ID</th>
                <th>Batch No.</th>
                <th>Student Name</th>
                <th>Score Card</th>
                <th>Score</th>
                <th>Result</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {selectedAllBatchStudents.length > 0 ? (
                selectedAllBatchStudents.map((data, index) => (
                  <tr key={index}>
                    <td>{indexOfFirstAllResult + index + 1}</td>
                    <td>{data.myArmyId}</td>
                    <td>{data.batch_no}</td>
                    <td>{data.myName}</td>
                    <td>
                      {data.imageData && (
                        <div>
                          <button
                            className="btn btn-warning"
                            onClick={() => handleImageClick(data.imageData)}
                          >
                            View Image
                          </button>
                        </div>
                      )}
                    </td>
                    <td>{data.score}</td>
                    <td>{data.final_result}</td>
                    <td style={{ fontSize: "0.8em" }}>{data.created_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">No Data Found</td>
                </tr>
              )}
            </tbody>
          </table>
          <Modal
          title="Result preview"
            open={modalVisible}
            onCancel={handleModalClose}

            centered
            width="80%"
           
            footer={[
              <Button key="close" onClick={handleModalClose}>
                Close
              </Button>,
            ]}
          >
            <img
              src={"data:image/png;base64," + selectedImage}
              style={{ width: "100%", height: "80vh", cursor: "pointer" }}
            />
          </Modal>
        </>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default Dashboard;
