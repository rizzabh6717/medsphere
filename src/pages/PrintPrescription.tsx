import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getPrescriptions, getAppointments, getUserProfile } from "@/lib/storage";
import { Printer, ArrowLeft } from "lucide-react";

const PrintPrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrescriptionData = () => {
      try {
        // Check if this is a temporary prescription from prescription management
        if (id === 'temp') {
          const tempPrescription = sessionStorage.getItem('tempPrescription');
          const tempAppointment = sessionStorage.getItem('tempAppointment');
          
          if (tempPrescription && tempAppointment) {
            setPrescription(JSON.parse(tempPrescription));
            setAppointment(JSON.parse(tempAppointment));
            // For temporary prescriptions, create a basic patient object
            setPatient({ 
              name: JSON.parse(tempAppointment).patientName,
              title: 'Mr.',
              age: 'Not specified',
              phone: '+91-XXXXXXXXXX',
              address: 'Patient Address'
            });
            setLoading(false);
            return;
          }
        }
        
        // Regular prescription loading
        const prescriptions = getPrescriptions();
        const appointments = getAppointments();
        const userProfile = getUserProfile();
        
        const rx = prescriptions.find((p: any) => p.id === id);
        if (rx) {
          setPrescription(rx);
          const apt = appointments.find((a: any) => a.id === rx.appointmentId);
          setAppointment(apt);
          setPatient(userProfile);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading prescription data:", error);
        setLoading(false);
      }
    };

    loadPrescriptionData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Prescription not found</p>
          <Button onClick={() => navigate('/patient/records')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Records
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-container { 
            width: 100%; 
            max-width: none; 
            margin: 0; 
            padding: 0;
            box-shadow: none;
            background: white;
          }
          .prescription-content {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
            font-size: 12pt;
          }
          .blue-header {
            background: #2563eb !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .blue-footer {
            background: #2563eb !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
        
        @page {
          size: A4;
          margin: 0;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-8">
        {/* Control Buttons - Hidden in print */}
        <div className="no-print max-w-4xl mx-auto mb-6 flex gap-4 px-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/patient/records')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Records
          </Button>
          <Button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            Print Prescription
          </Button>
        </div>

        {/* Prescription Container */}
        <div className="print-container max-w-4xl mx-auto bg-white shadow-lg">
          <div className="prescription-content" style={{ fontFamily: 'Arial, Calibri, Helvetica, sans-serif' }}>
            
            {/* Blue Header */}
            <div className="blue-header bg-blue-600 text-white px-8 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mb-1">Health Choice Clinic</h1>
                <p className="text-sm opacity-90">123 Medical Center Drive, Healthcare District</p>
                <p className="text-sm opacity-90">Email: contact@healthchoiceclinic.com | Phone: +91-9876543210</p>
              </div>
              <div className="text-right">
                <img 
                  src="/api/placeholder/80/80" 
                  alt="Clinic Logo" 
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-xs"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                />
              </div>
            </div>

            {/* Doctor and Prescription Info Header */}
            <div className="px-8 py-6 border-b-2 border-gray-200 flex justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800 mb-1">
                  Dr. {appointment?.doctorName || 'Medical Professional'}
                </h2>
                <p className="text-sm text-gray-600 mb-1">MBBS, MD - {appointment?.doctorSpecialty || 'General Medicine'}</p>
                <p className="text-sm text-gray-600 mb-1">Registration No: MED12345</p>
                <p className="text-sm text-gray-600">Contact: +91-9876543210</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  <span className="font-bold">Prescription No:</span> {prescription.id}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  <span className="font-bold">Date:</span> {new Date(prescription.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Diagnosis Section (if available) */}
            {prescription.diagnosis && (
              <div className="px-8 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Diagnosis:</h3>
                <p className="text-gray-700">{prescription.diagnosis}</p>
              </div>
            )}

            {/* Medicine List Section */}
            <div className="px-8 py-6">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Rx (Prescription)</h3>
              <div className="space-y-3">
                {prescription.items.map((medicine: any, index: number) => (
                  <div key={index} className="flex items-start">
                    <span className="text-gray-600 mr-3 mt-1">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">
                        [{medicine.medicine}, {medicine.dosage}; {medicine.duration}]
                      </p>
                      {medicine.instructions && (
                        <p className="text-sm text-gray-600 mt-1 ml-4">
                          Instructions: {medicine.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions Section (if available) */}
            {prescription.instructions && (
              <div className="px-8 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Doctor's Instructions:</h3>
                <p className="text-gray-700">{prescription.instructions}</p>
              </div>
            )}

            {/* Follow-up Section (if available) */}
            {prescription.followUp && (
              <div className="px-8 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Follow-up:</h3>
                <p className="text-gray-700">{prescription.followUp}</p>
              </div>
            )}

            {/* Patient Information Block */}
            <div className="px-8 py-6 mt-8 bg-gray-50">
              <h3 className="font-bold text-gray-800 mb-4">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">Patient Name:</span> {patient?.title || 'Mr.'} {patient?.name || 'Patient Name'}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-semibold">Age:</span> {patient?.age || 'Not specified'} years
                  </p>
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">Contact:</span> {patient?.phone || '+91-XXXXXXXXXX'}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-semibold">Address:</span> {patient?.address || 'Patient Address'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer - Spacer to push footer to bottom */}
            <div className="flex-1"></div>

            {/* Blue Footer */}
            <div className="blue-footer bg-blue-600 text-white px-8 py-3 mt-12 text-center">
              <p className="text-sm">
                Health Choice Clinic - Your Trusted Healthcare Partner | 
                Email: contact@healthchoiceclinic.com | Phone: +91-9876543210
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PrintPrescription;