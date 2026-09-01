'use client';

import React from 'react';

export default function RoomsTimetablePage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room Utilization</h1>
        <select className="border p-2 rounded">
          <option>Main Building</option>
          <option>Science Block</option>
        </select>
      </div>
      
      <div className="border rounded bg-white shadow-sm overflow-x-auto min-h-[400px]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2 w-32 bg-gray-50 text-left">Room / Time</th>
              {[...Array(8)].map((_, i) => (
                <th key={i} className="border-b p-2 border-l text-center text-sm">
                  {8 + i}:00
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { id: '101', name: 'Room 101', cap: 30, used: [1, 2, 4] },
              { id: '102', name: 'Room 102', cap: 40, used: [0, 1, 2, 3, 5] },
              { id: '201', name: 'Lab 201', cap: 25, used: [3, 4, 5, 6] },
              { id: '202', name: 'Lab 202', cap: 25, used: [0, 7] },
            ].map(room => (
              <tr key={room.id}>
                <td className="border-b p-2 font-semibold bg-gray-50">
                  <div>{room.name}</div>
                  <div className="text-xs text-gray-500 font-normal">Cap: {room.cap}</div>
                </td>
                {[...Array(8)].map((_, i) => (
                  <td key={i} className={`border-b p-1 border-l text-center h-16`}>
                    {room.used.includes(i) ? (
                      <div className="w-full h-full bg-red-100 border border-red-200 rounded flex items-center justify-center">
                        <span className="text-xs text-red-800 font-semibold">Occupied</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-green-50 border border-green-100 rounded flex items-center justify-center">
                        <span className="text-xs text-green-600">Free</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex space-x-4 text-sm">
        <div className="flex items-center"><span className="w-4 h-4 bg-red-100 border border-red-200 rounded inline-block mr-2"></span> Occupied</div>
        <div className="flex items-center"><span className="w-4 h-4 bg-green-50 border border-green-100 rounded inline-block mr-2"></span> Free</div>
      </div>
    </div>
  );
}
