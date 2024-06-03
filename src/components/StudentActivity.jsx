import React, { useState, useEffect } from "react";
import { Modal, Button, Pagination, Divider } from "antd";

const StudentActivity = ({ myArmyId, apiUrl }) => {
  const [dataList, setDataList] = useState([]);
  const [todaysDataList, setTodayDataList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchName, setSearchName] = useState(""); // New state for name filter
  const [allPage, setAllPage] = useState(1);
  const [latestPage, setLatestPage] = useState(1);
  const imagesPerPage = 5;

  useEffect(() => {
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
    const url = `${apiUrl}/get_particular_student_activity?myArmyId=${myArmyId}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.dataList) {
          setDataList(data.dataList);
          console.log(data.dataList.length);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [myArmyId, apiUrl]);

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
    setAllPage(page);
  };
  const handleLatestPageChange = (page) => {
    setLatestPage(page);
  };

  const indexOfLastAllResult = allPage * imagesPerPage;
  const indexOfFirstAllResult = indexOfLastAllResult - imagesPerPage;
  const allResults = dataList.slice(
    indexOfFirstAllResult,
    indexOfLastAllResult
  );

  return (
    <div className="container">
      <h1 className="heading underline " style={{ marginBottom: "1.2rem" }}>
        Student Performance Dashboard
      </h1>
      <h2>Overall Results</h2>
      <Pagination
        className=""
        size="lg"
        style={{ margin: "25px" }}
        current={allPage}
        pageSize={imagesPerPage}
        total={dataList.length}
        onChange={handlePageChange}
        showTotal={(total) => `Total ${total} results`}
        showQuickJumper
      />

      {allResults.length > 0 && allResults[0].imageData !== null ? (
        <div>
          <table className="student-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Army ID</th>
                <th>Student Name</th>
                <th>Score Card</th>
                <th>Score</th>
                <th>Result</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((data, index) => (
                <tr key={index}>
                  <td>{indexOfFirstAllResult + index + 1}</td>
                  <td>{data.myArmyId}</td>
                  <td>{data.myName}</td>
                  <td>
                    {data.imageData && (
                      <Button
                        className="blue"
                        variant="success"
                        onClick={() => handleImageClick(data.imageData)}
                      >
                        View Image
                      </Button>
                    )}
                  </td>
                  <td>{data.score}</td>
                  <td>{data.final_result}</td>
                  <td style={{ fontSize: "0.8em" }}>{data.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Modal
            open={modalVisible}
            onCancel={handleModalClose}
            centered
            width="80%"
            title='Result preview'
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
        </div>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default StudentActivity;
