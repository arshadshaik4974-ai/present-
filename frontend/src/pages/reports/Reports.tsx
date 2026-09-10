import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FileText, Download, Calendar } from 'lucide-react';

export const Reports: React.FC = () => {
  const reportTypes = [
    { title: 'Daily Attendance Report', desc: 'Complete breakdown of today\'s attendance across all classes.' },
    { title: 'Weekly Summary', desc: '7-day trend analysis and absentee list.' },
    { title: 'Monthly Class Report', desc: 'Detailed percentage per student for the selected month.' },
    { title: 'Defaulters List', desc: 'Students with attendance below 75% threshold.' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports" 
        description="Generate and download customized attendance reports."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.desc}</p>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" /> Select Date
                </Button>
                <Button variant="primary" className="flex-1">
                  <Download className="h-4 w-4 mr-2" /> Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
