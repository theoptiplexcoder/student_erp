'use client';

import React, { useState } from 'react';

export default function FacultyTimetablePage() {
  const [selectedFaculty, setSelectedFaculty] = useState('f1');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Faculty Load & Timetable</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 border-r pr-4">
          <h2 className="font-semibold mb-4">Select Faculty</h2>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setSelectedFaculty('f1')}
                className={`w-full text-left p-2 rounded ${selectedFaculty === 'f1' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
              >
                Dr. Smith (12 hrs)
              </button>
            </li>
            <li>
              <button 
                onClick={() => setSelectedFaculty('f2')}
                className={`w-full text-left p-2 rounded ${selectedFaculty === 'f2' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
              >
                Prof. Johnson (8 hrs)
              </button>
            </li>
          </ul>
        </div>
        
        <div className="flex-1">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Weekly View - {selectedFaculty === 'f1' ? 'Dr. Smith' : 'Prof. Johnson'}</h2>
            <div className="text-sm text-gray-500">Total Load: 12 hrs / week</div>
          </div>
          
          <div className="border rounded bg-white shadow-sm overflow-x-auto min-h-[400px]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2 w-24">Time</th>
                  <th className="border-b p-2 border-l">Mon</th>
                  <th className="border-b p-2 border-l">Tue</th>
                  <th className="border-b p-2 border-l">Wed</th>
                  <th className="border-b p-2 border-l">Thu</th>
                  <th className="border-b p-2 border-l">Fri</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td className="border-b p-2 text-sm text-gray-500 text-center">{8 + i}:00</td>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="border-b p-2 border-l h-16 relative">
                        {i === 2 && j === 1 && (
                          <div className="absolute inset-1 bg-blue-100 text-blue-800 text-xs p-1 rounded">
                            <div className="font-semibold">CS101</div>
                            <div>Room A1</div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
