import React from 'react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About DCC</h1>
        
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600">
              The Degahbur City Center (DCC) project aims to improve transparency, 
              accountability, and efficiency in city management through technology-driven 
              solutions. We provide a platform for citizens to report issues, track progress, 
              and participate in the development of their city.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Management</h3>
                <p className="text-gray-600">
                  Submit and track reports on various city issues, from infrastructure 
                  problems to administrative concerns.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Transparency</h3>
                <p className="text-gray-600">
                  View and monitor city budget allocations and expenditures across 
                  different sectors.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Verification</h3>
                <p className="text-gray-600">
                  Community-driven verification system to ensure the accuracy and 
                  reliability of reported issues.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                <p className="text-gray-600">
                  Receive instant notifications and track the progress of reported 
                  issues in real-time.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              For any inquiries or support, please contact us at:
            </p>
            <div className="mt-4 text-gray-600">
              <p>Email: support@dcc.gov.et</p>
              <p>Phone: +251 920 064 411</p>
              <p>Address: Degahbur City Administration Office</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About; 