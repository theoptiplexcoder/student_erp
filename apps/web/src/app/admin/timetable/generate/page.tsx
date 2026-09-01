'use client';

import React, { useState } from 'react';

export default function GenerateTimetablePage() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auto-Generate Timetable</h1>
      
      <div className="flex mb-8 space-x-4 border-b pb-4">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`flex-1 text-center ${step === s ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
            Step {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl mb-4">Step 1: Select Term and Sections</h2>
          <select className="border p-2 w-full mb-4 rounded"><option>Fall 2024</option></select>
          <div className="border p-4 rounded min-h-[100px] mb-4">
            <label className="flex items-center space-x-2"><input type="checkbox" /><span>Section A</span></label>
            <label className="flex items-center space-x-2 mt-2"><input type="checkbox" /><span>Section B</span></label>
          </div>
          <button onClick={() => setStep(2)} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl mb-4">Step 2: Configure Constraints</h2>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block mb-1">Slot Size (minutes)</label>
              <input type="number" defaultValue={60} className="border p-2 rounded" />
            </div>
            <div>
              <label className="block mb-1">Available Hours</label>
              <div className="flex space-x-2">
                <input type="time" defaultValue="08:00" className="border p-2 rounded" />
                <span className="self-center">to</span>
                <input type="time" defaultValue="16:00" className="border p-2 rounded" />
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setStep(1)} className="bg-gray-200 px-4 py-2 rounded">Back</button>
            <button onClick={() => setStep(3)} className="bg-blue-600 text-white px-4 py-2 rounded">Generate</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-xl mb-4">Step 3: Preview Generated Timetable</h2>
          <div className="bg-gray-50 border p-4 rounded h-64 flex items-center justify-center mb-4">
            [Timetable Preview Grid Here]
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setStep(2)} className="bg-gray-200 px-4 py-2 rounded">Back</button>
            <button onClick={() => setStep(4)} className="bg-blue-600 text-white px-4 py-2 rounded">Confirm & Save</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-xl mb-4 text-green-600">Generation Complete!</h2>
          <p className="mb-4">The timetable has been successfully generated as DRAFT.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">View Timetable</button>
        </div>
      )}
    </div>
  );
}
