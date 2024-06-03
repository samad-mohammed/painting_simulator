import React from 'react'
import UploadBook from './UploadBook'
import ShowUploads from './ShowUploads'
export default function InstructorComp({ apiUrl}) {
  return (
    <div>
        <UploadBook   apiUrl={apiUrl}/>
        <h1 className="heading underline mt-3 mb-3" style={{ }}>Uploaded books</h1>
        <ShowUploads apiUrl={apiUrl}/>
    </div>
  )
}
