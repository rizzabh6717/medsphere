import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationHeader from "@/components/NavigationHeader";
import { FileText, Download, Calendar, CalendarDays, Clock, User, Pill, Activity, Printer } from "lucide-react";
import { getAppointments, getPrescriptions, getUserProfile, getFollowUps } from "@/lib/storage";
import { DOCTORS } from "@/lib/doctors";
import jsPDF from 'jspdf';
import { toast } from "sonner";

const Records = () => {
  const navigate = useNavigate();
  const [completedAppointments, setCompletedAppointments] = useState<any[]>([]);
  const [rxList, setRxList] = useState<any[]>([]);

  useEffect(() => {
    const load = () => {
      const appointments = getAppointments();
      const completed = appointments.filter(apt => apt.status === 'completed');
      setCompletedAppointments(completed);
      try {
        const profile = getUserProfile();
        const phoneRaw = profile?.phone || '';
        const normalize = (s: string) => (s || '').replace(/\D/g, '');
        const phone = normalize(phoneRaw);
        const allRx = getPrescriptions();
        // Build phone set from all appointments on this device (patient-side), no name filter to avoid mismatch
        const phoneSet = new Set(appointments.map(a => normalize(a.patientPhone)).filter(Boolean));
        // Use relaxed matching: by phone in set, or by exact phone, or by partial name match
        const nameLc = (profile?.name || '').toLowerCase();
        const firstNameLc = nameLc.split(' ')[0] || '';
        const filtered = allRx.filter((r: any) => {
          const rp = normalize(r.patientPhone);
          const rname = (r.patientName || '').toLowerCase();
          const nameMatch = nameLc ? (rname.includes(nameLc) || (firstNameLc && rname.includes(firstNameLc))) : false;
          return (phone && rp === phone) || phoneSet.has(rp) || nameMatch;
        });
        
        // Group prescriptions by patient (using patientName as primary identifier)
        const groupedRx = filtered.reduce((acc: any, rx: any) => {
          const apt = rx.appointmentId ? appointments.find((a: any) => a.id === rx.appointmentId) : appointments.find((a: any) => a.patientPhone === rx.patientPhone && a.doctorId === rx.doctorId);
          const patientKey = rx.patientName || apt?.patientName || 'Unknown Patient';
          
          if (!acc[patientKey]) {
            acc[patientKey] = {
              patientName: patientKey,
              patientPhone: rx.patientPhone || apt?.patientPhone,
              prescriptions: []
            };
          }
          
          acc[patientKey].prescriptions.push(rx);
          return acc;
        }, {});
        
        // Convert grouped data to array and sort prescriptions by date (newest first)
        const groupedArray = Object.values(groupedRx).map((group: any) => ({
          ...group,
          prescriptions: group.prescriptions.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        }));
        
        setRxList(groupedArray);
      } catch {}
    };
    load();
    const onUpdate = () => load();
    window.addEventListener('prescriptions:updated', onUpdate);
    return () => window.removeEventListener('prescriptions:updated', onUpdate);
  }, []);

  const generatePrescriptionPDF = (rx: any, apt: any, displayPatient: string) => {
    const pdf = new jsPDF();
    
    // Set up fonts and colors
    pdf.setFontSize(20);
    pdf.setTextColor(91, 104, 238); // Primary color
    pdf.text('MedSphere - Prescription', 20, 25);
    
    // Add horizontal line
    pdf.setDrawColor(91, 104, 238);
    pdf.setLineWidth(0.5);
    pdf.line(20, 30, 190, 30);
    
    // Doctor and clinic info
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Dr. ${apt?.doctorName || 'Doctor'}`, 20, 45);
    pdf.setFontSize(10);
    pdf.text(`${apt?.doctorSpecialty || 'General Medicine'}`, 20, 52);
    
    // Patient info
    pdf.setFontSize(12);
    pdf.text(`Patient: ${displayPatient}`, 20, 65);
    pdf.text(`Date: ${new Date(rx.createdAt).toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    })}`, 20, 72);
    pdf.text(`Prescription ID: ${rx.id}`, 20, 79);
    
    let yPosition = 95;
    
    // Diagnosis section
    if (rx.diagnosis) {
      pdf.setFontSize(12);
      pdf.setTextColor(91, 104, 238);
      pdf.text('Diagnosis:', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      const diagnosisLines = pdf.splitTextToSize(rx.diagnosis, 170);
      pdf.text(diagnosisLines, 20, yPosition + 7);
      yPosition += diagnosisLines.length * 5 + 15;
    }
    
    // Medications section
    pdf.setFontSize(12);
    pdf.setTextColor(91, 104, 238);
    pdf.text('Prescribed Medications:', 20, yPosition);
    yPosition += 10;
    
    rx.items.forEach((med: any, index: number) => {
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${index + 1}. ${med.medicine}`, 25, yPosition);
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`   ${med.dosage} • ${med.duration}`, 25, yPosition + 5);
      yPosition += 15;
      
      // Add new page if needed
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
    });
    
    // Instructions section
    if (rx.instructions) {
      yPosition += 5;
      pdf.setFontSize(12);
      pdf.setTextColor(91, 104, 238);
      pdf.text('Doctor\'s Instructions:', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      const instructionLines = pdf.splitTextToSize(rx.instructions, 170);
      pdf.text(instructionLines, 20, yPosition + 7);
      yPosition += instructionLines.length * 5 + 10;
    }
    
    // Follow-up section
    if (rx.followUp) {
      yPosition += 5;
      pdf.setFontSize(12);
      pdf.setTextColor(91, 104, 238);
      pdf.text('Follow-up:', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text(rx.followUp, 20, yPosition + 7);
      yPosition += 15;
    }
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Generated by MedSphere - Digital Healthcare Platform', 20, 280);
    pdf.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, 285);
    
    // Save the PDF
    const fileName = `Prescription_${displayPatient.replace(/\s+/g, '_')}_${new Date(rx.createdAt).toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  // Convert image to Base64
  const convertImageToBase64 = (imagePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = function() {
        reject(new Error('Failed to load image'));
      };
      img.src = imagePath;
    });
  };

  const generateCombinedPrescriptionPDF = async (prescriptions: any[], patientName: string) => {
    const appointments = getAppointments();
    
    // Collect all data
    const allMedicines: any[] = [];
    const allDiagnoses: string[] = [];
    const allInstructions: string[] = [];
    const allFollowUps: string[] = [];
    const doctorInfo = new Set<string>();
    
    prescriptions.forEach((rx) => {
      const apt = rx.appointmentId ? appointments.find((a: any) => a.id === rx.appointmentId) : appointments.find((a: any) => a.patientPhone === rx.patientPhone && a.doctorId === rx.doctorId);
      
      rx.items.forEach((med: any) => {
        allMedicines.push({
          ...med,
          prescriptionDate: rx.createdAt,
          prescriptionId: rx.id,
          doctorName: apt?.doctorName || 'Doctor'
        });
      });
      
      if (rx.diagnosis) allDiagnoses.push(rx.diagnosis);
      if (rx.instructions) allInstructions.push(rx.instructions);
      if (rx.followUp) allFollowUps.push(rx.followUp);
      if (apt?.doctorName) doctorInfo.add(`Dr. ${apt.doctorName} (${apt.doctorSpecialty || 'General Medicine'})`);
    });

    // Try to get Base64 logo
    let logoBase64 = '';
    try {
      logoBase64 = await convertImageToBase64(`${window.location.origin}/assets/logo.png`);
    } catch (e) {
      console.log('Logo not found, using placeholder');
    }

    // Function to generate PDF with Base64 logo
    const generatePDF = () => {
      const pdf = new jsPDF();
      
      // Blue Header with Logo
      pdf.setFillColor(37, 99, 235); // #2563eb
      pdf.rect(0, 0, 210, 35, 'F');
      
      // Header Text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Health Choice Clinic', 15, 18);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('123 Medical Center Drive, Healthcare District', 15, 25);
      pdf.text('Email: contact@healthchoiceclinic.com | Phone: +91-9876543210', 15, 31);
      
      // Add logo or placeholder
      if (logoBase64) {
        try {
          pdf.addImage(logoBase64, 'PNG', 173, 5, 25, 25, undefined, 'FAST');
        } catch (e) {
          // Fallback to placeholder
          pdf.setFillColor(255, 255, 255, 0.2);
          pdf.circle(185, 17.5, 12, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(8);
          pdf.text('LOGO', 180, 18);
        }
      } else {
        // Placeholder
        pdf.setFillColor(255, 255, 255, 0.2);
        pdf.circle(185, 17.5, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text('LOGO', 180, 18);
      }
    
    let yPosition = 50;
    
    // Doctor and Prescription Info
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(Array.from(doctorInfo).join(', ') || 'Dr. Medical Professional', 15, yPosition);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Registration No: MED12345', 15, yPosition + 7);
    pdf.text('Contact: +91-9876543210', 15, yPosition + 14);
    
    // Right side info
    pdf.setFont('helvetica', 'bold');
    pdf.text('Combined Prescription', 140, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 140, yPosition + 7);
    pdf.text(`Total Prescriptions: ${prescriptions.length}`, 140, yPosition + 14);
    
    // Line separator
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(15, yPosition + 20, 195, yPosition + 20);
    
    yPosition += 35;
    
    // Diagnoses
    if (allDiagnoses.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 65, 81);
      pdf.text('Diagnosis:', 15, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      allDiagnoses.forEach((diagnosis) => {
        const diagnosisLines = pdf.splitTextToSize(`• ${diagnosis}`, 170);
        pdf.text(diagnosisLines, 15, yPosition);
        yPosition += diagnosisLines.length * 5 + 3;
      });
      yPosition += 10;
    }
    
    // Medicines
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 65, 81);
    pdf.text('Rx (Complete Prescription)', 15, yPosition);
    yPosition += 10;
    
    allMedicines.forEach((medicine, index) => {
      // Alternating background
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(15, yPosition - 3, 180, 12, 'F');
      }
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(107, 114, 128);
      pdf.text(`${index + 1}.`, 18, yPosition + 3);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(55, 65, 81);
      const medicineText = `[${medicine.medicine}, ${medicine.dosage}; ${medicine.duration}]`;
      pdf.text(medicineText, 25, yPosition + 3);
      
      // Date
      pdf.setFontSize(9);
      pdf.setTextColor(156, 163, 175);
      const dateText = new Date(medicine.prescriptionDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' });
      pdf.text(dateText, 175, yPosition + 3);
      
      yPosition += 8;
      
      // Instructions
      if (medicine.instructions) {
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        const instructionLines = pdf.splitTextToSize(`Instructions: ${medicine.instructions}`, 160);
        pdf.text(instructionLines, 30, yPosition);
        yPosition += instructionLines.length * 4;
      }
      
      yPosition += 3;
      
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
    });
    
    yPosition += 10;
    
    // Instructions
    if (allInstructions.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 65, 81);
      pdf.text("Doctor's Instructions:", 15, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      allInstructions.forEach((instruction) => {
        const instructionLines = pdf.splitTextToSize(`• ${instruction}`, 170);
        pdf.text(instructionLines, 15, yPosition);
        yPosition += instructionLines.length * 5 + 3;
      });
      yPosition += 10;
    }
    
    // Follow-ups
    if (allFollowUps.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 65, 81);
      pdf.text('Follow-up:', 15, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      allFollowUps.forEach((followUp) => {
        const followUpLines = pdf.splitTextToSize(`• ${followUp}`, 170);
        pdf.text(followUpLines, 15, yPosition);
        yPosition += followUpLines.length * 5 + 3;
      });
      yPosition += 10;
    }
    
    // Patient Information
    pdf.setFillColor(249, 250, 251);
    pdf.rect(15, yPosition, 180, 25, 'F');
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(55, 65, 81);
    pdf.text('Patient Information', 20, yPosition + 8);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Patient Name: Mr. ${patientName}`, 20, yPosition + 15);
    pdf.text('Age: Not specified years', 20, yPosition + 20);
    pdf.text('Contact: +91-XXXXXXXXXX', 110, yPosition + 15);
    pdf.text('Address: Patient Address', 110, yPosition + 20);
    
    // Blue Footer
    const footerY = 280;
    pdf.setFillColor(37, 99, 235); // #2563eb
    pdf.rect(0, footerY, 210, 17, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Health Choice Clinic - Your Trusted Healthcare Partner | Email: contact@healthchoiceclinic.com | Phone: +91-9876543210', 15, footerY + 10);
    
      // Save PDF
      const fileName = `Complete_Prescription_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    };

    // Generate PDF with Base64 logo
    generatePDF();
  };

  const printAllPrescriptions = async (prescriptions: any[], patientName: string) => {
    const appointments = getAppointments();
    
    // Get Base64 logo for print
    let logoBase64 = '';
    try {
      logoBase64 = await convertImageToBase64(`${window.location.origin}/assets/logo.png`);
    } catch (e) {
      console.log('Logo not found for print, using placeholder');
    }
    
    // Create a comprehensive print window with all prescriptions
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Collect all medicines from all prescriptions
    const allMedicines: any[] = [];
    const allDiagnoses: string[] = [];
    const allInstructions: string[] = [];
    const allFollowUps: string[] = [];
    const doctorInfo = new Set<string>();
    
    prescriptions.forEach((rx) => {
      const apt = rx.appointmentId ? appointments.find((a: any) => a.id === rx.appointmentId) : appointments.find((a: any) => a.patientPhone === rx.patientPhone && a.doctorId === rx.doctorId);
      
      // Collect medicines with prescription info
      rx.items.forEach((med: any) => {
        allMedicines.push({
          ...med,
          prescriptionDate: rx.createdAt,
          prescriptionId: rx.id,
          doctorName: apt?.doctorName || 'Doctor'
        });
      });
      
      // Collect other data
      if (rx.diagnosis) allDiagnoses.push(rx.diagnosis);
      if (rx.instructions) allInstructions.push(rx.instructions);
      if (rx.followUp) allFollowUps.push(rx.followUp);
      if (apt?.doctorName) doctorInfo.add(`Dr. ${apt.doctorName} (${apt.doctorSpecialty || 'General Medicine'})`);
    });
    
    // Get the latest prescription for main details
    const latestRx = prescriptions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const latestApt = latestRx.appointmentId ? appointments.find((a: any) => a.id === latestRx.appointmentId) : appointments.find((a: any) => a.patientPhone === latestRx.patientPhone && a.doctorId === latestRx.doctorId);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MedSphere - Complete Prescription for ${patientName}</title>
          <style>
            body { 
              font-family: Arial, Calibri, Helvetica, sans-serif; 
              margin: 0; 
              padding: 0; 
              line-height: 1.4; 
            }
            .blue-header {
              background: #2563eb !important;
              color: white !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .blue-footer {
              background: #2563eb !important;
              color: white !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .blue-header {
                background: #2563eb !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .blue-footer {
                background: #2563eb !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            @page {
              size: A4;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div style="max-width: 210mm; margin: 0 auto;">
            
            <!-- Blue Header -->
            <div class="blue-header" style="background: #2563eb; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 5px 0;">Health Choice Clinic</h1>
                <p style="font-size: 14px; opacity: 0.9; margin: 0;">123 Medical Center Drive, Healthcare District</p>
                <p style="font-size: 14px; opacity: 0.9; margin: 0;">Email: contact@healthchoiceclinic.com | Phone: +91-9876543210</p>
              </div>
              <div style="text-align: right;">
                ${logoBase64 ? `
                  <img 
                    src="${logoBase64}" 
                    alt="Clinic Logo" 
                    style="width: 70px; height: 70px; border-radius: 50%; background: white; padding: 5px;"
                  />
                ` : `
                  <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                    LOGO
                  </div>
                `}
              </div>
            </div>

            <!-- Doctor and Prescription Info Header -->
            <div style="padding: 20px; border-bottom: 2px solid #e5e7eb; display: flex; justify-content: space-between;">
              <div>
                <h2 style="font-size: 18px; font-weight: bold; color: #374151; margin: 0 0 5px 0;">
                  ${Array.from(doctorInfo).join(', ') || 'Dr. Medical Professional'}
                </h2>
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 5px 0;">Registration No: MED12345</p>
                <p style="font-size: 14px; color: #6b7280; margin: 0;">Contact: +91-9876543210</p>
              </div>
              <div style="text-align: right;">
                <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 5px 0;">
                  <span style="font-weight: bold;">Combined Prescription</span>
                </p>
                <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0;">
                  <span style="font-weight: bold;">Date:</span> ${new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
                <p style="font-size: 14px; color: #6b7280; margin: 5px 0 0 0;">
                  Total Prescriptions: ${prescriptions.length}
                </p>
              </div>
            </div>

            ${allDiagnoses.length > 0 ? `
              <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                <h3 style="font-weight: bold; color: #374151; margin: 0 0 10px 0;">Diagnosis:</h3>
                ${allDiagnoses.map((diagnosis, index) => `
                  <p style="color: #4b5563; margin: 0 0 5px 0;">• ${diagnosis}</p>
                `).join('')}
              </div>
            ` : ''}

            <!-- All Medicines Combined -->
            <div style="padding: 20px;">
              <h3 style="font-weight: bold; color: #374151; margin: 0 0 15px 0; font-size: 18px;">Rx (Complete Prescription)</h3>
              <div>
                ${allMedicines.map((medicine, index) => `
                  <div style="margin-bottom: 12px; padding: 8px; background: ${index % 2 === 0 ? '#f9fafb' : 'white'}; border-radius: 5px;">
                    <div style="display: flex; justify-content: between; align-items: start;">
                      <span style="color: #6b7280; margin-right: 10px; font-weight: bold;">${index + 1}.</span>
                      <span style="color: #374151; font-weight: 500; flex-grow: 1;">
                        [${medicine.medicine}, ${medicine.dosage}; ${medicine.duration}]
                      </span>
                      <span style="font-size: 12px; color: #9ca3af; margin-left: 10px;">
                        ${new Date(medicine.prescriptionDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    ${medicine.instructions ? `
                      <div style="margin-left: 20px; margin-top: 3px;">
                        <span style="font-size: 14px; color: #6b7280;">Instructions: ${medicine.instructions}</span>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>

            ${allInstructions.length > 0 ? `
              <div style="padding: 20px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
                <h3 style="font-weight: bold; color: #374151; margin: 0 0 10px 0;">Doctor's Instructions:</h3>
                ${allInstructions.map((instruction, index) => `
                  <p style="color: #4b5563; margin: 0 0 5px 0;">• ${instruction}</p>
                `).join('')}
              </div>
            ` : ''}

            ${allFollowUps.length > 0 ? `
              <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                <h3 style="font-weight: bold; color: #374151; margin: 0 0 10px 0;">Follow-up:</h3>
                ${allFollowUps.map((followUp, index) => `
                  <p style="color: #4b5563; margin: 0 0 5px 0;">• ${followUp}</p>
                `).join('')}
              </div>
            ` : ''}

            <!-- Patient Information Block -->
            <div style="padding: 20px; background: #f9fafb; margin: 20px;">
              <h3 style="font-weight: bold; color: #374151; margin: 0 0 15px 0;">Patient Information</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <p style="font-size: 14px; margin: 0 0 5px 0;">
                    <span style="font-weight: 600;">Patient Name:</span> Mr. ${patientName}
                  </p>
                  <p style="font-size: 14px; margin: 0;">
                    <span style="font-weight: 600;">Age:</span> Not specified years
                  </p>
                </div>
                <div>
                  <p style="font-size: 14px; margin: 0 0 5px 0;">
                    <span style="font-weight: 600;">Contact:</span> +91-XXXXXXXXXX
                  </p>
                  <p style="font-size: 14px; margin: 0;">
                    <span style="font-weight: 600;">Address:</span> Patient Address
                  </p>
                </div>
              </div>
            </div>

            <!-- Blue Footer -->
            <div class="blue-footer" style="background: #2563eb; color: white; padding: 15px; text-align: center;">
              <p style="font-size: 14px; margin: 0;">
                Health Choice Clinic - Your Trusted Healthcare Partner | 
                Email: contact@healthchoiceclinic.com | Phone: +91-9876543210
              </p>
            </div>
            
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const PatientRecordCard = ({ patientRecord }: any) => {
    const appointments = getAppointments();
    const { patientName, patientPhone, prescriptions } = patientRecord;

    // Trigger re-render on follow-up updates so reschedules appear immediately
    const [fuTick, setFuTick] = useState(0);
    useEffect(() => {
      const onUpdate = () => setFuTick((t) => t + 1);
      window.addEventListener('followUps:updated', onUpdate);
      return () => window.removeEventListener('followUps:updated', onUpdate);
    }, []);

    // Build follow-up reminders for this patient (by exact name or normalized phone)
    const normalize = (s: string) => (s || '').replace(/\D/g, '');
    const nameKey = (patientName || '').toLowerCase().trim();
    const phoneKey = normalize(patientPhone || '');
    const reminders = getFollowUps()
      .filter((f: any) => {
        const fname = (f.patientName || '').toLowerCase().trim();
        const fphone = normalize(f.patientId || '');
        return fname === nameKey || (!!phoneKey && fphone === phoneKey);
      })
      .filter((f: any) => ["scheduled", "rescheduled", "missed"].includes(f.status))
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Notify if any reminder is within 24 hours
    useEffect(() => {
      const now = Date.now();
      reminders.forEach((f: any) => {
        if (f.status === 'scheduled' || f.status === 'rescheduled') {
          const ts = new Date(`${f.date.split('T')[0]}T${f.time}:00`).getTime();
          const diffHrs = (ts - now) / (1000 * 60 * 60);
          if (diffHrs > 0 && diffHrs <= 24) {
            toast.warning(`Follow-up with ${f.doctorName} in ${Math.max(1, Math.floor(diffHrs))} hour(s)!`, { duration: 5000 });
          }
        }
      });
    }, [fuTick, reminders.length]);

    // reference fuTick to ensure component re-renders when it changes
    void fuTick;

    const chip = (status: string) => {
      if (status === 'missed') return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">🔴 Missed</span>;
      if (status === 'rescheduled') return <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700">🟠 Pending</span>;
      return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">🟢 Scheduled</span>;
    };

    const fmtDateTime = (isoDate: string, time: string) => {
      const d = new Date(isoDate);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + `, ${time}`;
    };
    
    return (
      <Card className="p-6 mb-4 animate-fade-in hover:shadow-md transition-shadow">
        {/* Patient Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">{patientName}</h3>
              <p className="text-muted-foreground">Medical Records</p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span>{prescriptions.length} Prescription{prescriptions.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active Patient
          </Badge>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-6">
          {prescriptions.map((rx: any, index: number) => {
            const apt = rx.appointmentId ? appointments.find((a: any) => a.id === rx.appointmentId) : appointments.find((a: any) => a.patientPhone === rx.patientPhone && a.doctorId === rx.doctorId);
            
            return (
              <div key={rx.id} className="border-b border-gray-100 last:border-b-0">
                <div className="md:grid md:grid-cols-3 gap-4">
                  {/* Left: Prescription content */}
                  <div className="md:col-span-2 border-l-4 border-blue-200 pl-4 pb-4">
                    {/* Prescription Header */}
                    <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Dr. {apt?.doctorName || 'Doctor'}
                    </h4>
                    <p className="text-sm text-muted-foreground">{apt?.doctorSpecialty || 'General Medicine'}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(rx.createdAt).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Prescription #{index + 1}
                  </Badge>
                </div>

                {/* Diagnosis */}
                {rx.diagnosis && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-semibold text-sm text-blue-800 mb-1">Diagnosis</h5>
                    <p className="text-blue-700 text-sm">{rx.diagnosis}</p>
                  </div>
                )}

                {/* Medications */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="w-4 h-4 text-primary" />
                    <h5 className="font-semibold text-sm">Prescribed Medications</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {rx.items.map((med: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="font-medium text-sm">{med.medicine}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {med.dosage} • {med.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                {rx.instructions && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <h5 className="font-semibold text-sm">Doctor's Instructions</h5>
                    </div>
                    <p className="text-sm bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg">
                      {rx.instructions}
                    </p>
                  </div>
                )}

                {/* Follow-up */}
                {rx.followUp && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Follow-up: </span>
                      {rx.followUp}
                    </p>
                  </div>
                )}
                  </div>

                  {/* Right: Follow-Up Reminders widget */}
                  <div className="md:col-span-1 mt-4 md:mt-0">
                    <div className="bg-white border border-gray-200 rounded-lg p-3 h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <h5 className="font-semibold text-sm">Follow-Up Reminders</h5>
                      </div>
                      {reminders.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No reminders</p>
                      ) : (
                        <div className="space-y-2">
                          {reminders.map((f: any) => {
                            // Resolve doctor names by id to avoid stale storage names
                            const nameById = (id: any, fallback?: string) => DOCTORS.find(d => d.id.toString() === String(id))?.name || fallback;

                            let rescheduledText: string | null = null;
                            let headingName = nameById(f.doctorId, f.doctorName);
                            let displayDate = f.date;
                            let displayTime = f.time;

                            if (f.status === 'rescheduled') {
                              const all = getFollowUps();
                              const samePatient = (g: any) => (
                                (g.patientName || '').toLowerCase().trim() === (f.patientName || '').toLowerCase().trim() ||
                                ((g.patientId || '').replace(/\D/g,'') === (f.patientId || '').replace(/\D/g,''))
                              );
                              const localCandidates = reminders
                                .filter((g: any) => g.status === 'scheduled' && samePatient(g))
                                .sort((a: any, b: any) => new Date(a.createdAt||a.date).getTime() - new Date(b.createdAt||b.date).getTime());

                              let target = localCandidates.find((g: any) => g.isReassigned && !!g.originalDoctorId && String(g.originalDoctorId) === String(f.doctorId));
                              if (!target) target = localCandidates.find((g: any) => String(g.doctorId) !== String(f.doctorId));
                              if (!target) target = localCandidates.find((g: any) => new Date(g.createdAt||g.date).getTime() >= new Date(f.createdAt||f.date).getTime());
                              if (!target && localCandidates.length) target = localCandidates[localCandidates.length - 1];
                              if (!target) {
                                const globalCandidates = all.filter((g: any) => g.status==='scheduled' && samePatient(g));
                                target = globalCandidates.find((g: any) => g.isReassigned && !!g.originalDoctorId && String(g.originalDoctorId) === String(f.doctorId))
                                  || globalCandidates.find((g: any) => String(g.doctorId) !== String(f.doctorId))
                                  || globalCandidates.sort((a: any,b: any)=>new Date(a.createdAt||a.date).getTime()-new Date(b.createdAt||b.date).getTime())[0];
                              }

                              const toName = nameById(target?.doctorId, target?.doctorName);
                              const fromName = nameById(f.doctorId, f.doctorName) || `Dr. ${f.doctorId}`;
                              if (toName) {
                                rescheduledText = `Rescheduled from ${fromName} to ${toName}`;
                                headingName = toName;
                                displayDate = target?.date || displayDate;
                                displayTime = target?.time || displayTime;
                              } else {
                                rescheduledText = `Rescheduled from ${fromName}`;
                              }
                            } else if (f.status === 'scheduled' && f.isReassigned && f.originalDoctorId) {
                              const fromName = nameById(f.originalDoctorId, undefined) || `Dr. ${f.originalDoctorId}`;
                              rescheduledText = `Rescheduled from ${fromName}`;
                              headingName = nameById(f.doctorId, f.doctorName) || headingName;
                            }

                            return (
                              <div key={f.id} className="p-2 rounded-lg border border-gray-200 bg-gray-50">
                                <div className="text-sm font-medium text-gray-800">{headingName}</div>
                                {rescheduledText && (
                                  <div className="text-xs text-orange-600 mt-0.5">{rescheduledText}</div>
                                )}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{fmtDateTime(displayDate, displayTime)}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  {chip(f.status)}
                                  <Button size="sm" className="bg-[#5B68EE] hover:bg-[#4A56DD] text-white h-7 px-2" onClick={() => window.location.href = '/patient/followups'}>
                                    Reschedule
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Print and PDF Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
          <Button 
            style={{ backgroundColor: '#5B68EE' }}
            className="flex-1 text-white hover:opacity-90 rounded-xl"
            onClick={() => generateCombinedPrescriptionPDF(prescriptions, patientName)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button 
            variant="outline"
            style={{ borderColor: '#5B68EE', color: '#5B68EE' }}
            className="flex-1 hover:opacity-80 rounded-xl"
            onClick={() => printAllPrescriptions(prescriptions, patientName)}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-medical flex flex-col">
      <NavigationHeader />
      <div className="container mx-auto px-4 max-w-4xl py-8 flex-1 mb-auto">
        <div className="bg-white rounded-lg px-6 py-4 mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Medical Records</h1>
          <p className="text-muted-foreground">
            View your prescriptions and medical history
          </p>
        </div>

        <Tabs defaultValue="prescriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white">
            <TabsTrigger 
              value="prescriptions"
              className="data-[state=active]:bg-[#5B68EE] data-[state=active]:text-white"
            >
              Prescriptions
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-[#5B68EE] data-[state=active]:text-white"
            >
              Lab Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions">
            {rxList.length > 0 ? (
              rxList.map((patientRecord, index) => (
                <PatientRecordCard key={`patient-${index}`} patientRecord={patientRecord} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Records Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Your medical records and prescriptions will appear here after completed appointments
                </p>
                <Button onClick={() => window.location.href = '/patient/dashboard'} className="bg-[#5B68EE] hover:bg-[#4A56DD]">
                  Book an Appointment
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Lab Reports</h3>
              <p className="text-muted-foreground">
                Your lab reports will be available here
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Simple White Footer Block */}
      <div className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} MedSphere. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Records;
