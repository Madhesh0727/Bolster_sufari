import "./ETicket.css";
import React, { useRef, useState } from "react";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import logo from "../media/logo.svg";

export default function ETicket({ 
  booking = {
    booking_ref: 'BS-2024-0715',
    customer_name: 'ALEXANDER JOHNSON',
    trip_title: 'CULTURAL EXPLORATION',
    destinations: 'TOKYO - KYOTO - MT. FUJI',
    date: 'MARCH 12-26, 2025',
    travel_modes: 'INTERNATIONAL FLIGHTS, BULLET TRAIN',
    adults: 2,
    children: 0,
    agency_name: 'BOLSTER SAFARI',
    confirmation_code: 'BSO-987-XYZ',
    additional_travelers: []
  }
}) {
  const ticketRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fallback to defaults if no booking is passed
  const passenger = {
    name: booking.customer_name || "ALEXANDER JOHNSON",
    ticket: booking.booking_ref || "BS-2024-0715",
    confirmation: booking.confirmation_code || "BSO-987-XYZ",
    date: booking.date || "MARCH 12-26, 2025",
    destination: booking.destinations || "TOKYO → KYOTO → MT. FUJI",
    trip: booking.trip_title || "CITY BREAK / CULTURAL",
    travel: booking.travel_modes || "INTERNATIONAL FLIGHTS, BULLET TRAIN",
    adults: booking.number_of_people || booking.adults || 1,
    children: booking.children ?? 0,
    agency: booking.agency_name || "BOLSTER SAFARI",
    additional: booking.additional_travelers || []
  };

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setIsGenerating(true);
    
    // Temporarily scroll to top to prevent html2canvas cropping issues
    const originalScroll = window.scrollY;
    window.scrollTo(0, 0);
    
    try {
      const canvas = await html2canvas(ticketRef.current, { 
        scale: 2, // High quality (2 is plenty for A4, 3 causes massive files)
        useCORS: true,
        backgroundColor: '#051d38', // Matches background
        logging: false
      });
      
      // Use JPEG with 0.8 quality instead of uncompressed PNG
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      
      // A4 format dimensions
      // 'compress: true' automatically compresses the PDF internal streams
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const margin = 15; // 15mm margin
      const maxPdfWidth = pdfWidth - (margin * 2);
      const maxPdfHeight = pdfHeight - (margin * 2);
      
      // Scale to fit width first
      let scaledWidth = maxPdfWidth;
      let scaledHeight = (imgProps.height * scaledWidth) / imgProps.width;
      
      // If scaled height exceeds page height, scale by height instead
      if (scaledHeight > maxPdfHeight) {
        scaledHeight = maxPdfHeight;
        scaledWidth = (imgProps.width * scaledHeight) / imgProps.height;
      }
      
      // Center perfectly on the page
      const xOffset = (pdfWidth - scaledWidth) / 2;
      const yOffset = (pdfHeight - scaledHeight) / 2;
      
      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight);
      pdf.save(`ETicket_${passenger.ticket}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      window.scrollTo(0, originalScroll);
      setIsGenerating(false);
    }
  };

  return (
    <div className="ticket-wrapper">
      <button className="download-btn" onClick={handleDownload} disabled={isGenerating}>
        {isGenerating ? 'GENERATING A4 PDF...' : 'DOWNLOAD E-TICKET'}
      </button>

      <div className="ticket" ref={ticketRef}>
        <div className="border">
          <div className="header">
            <h1>BOLSTER SAFARI</h1>
            <img src={logo} className="logo" alt="Logo" style={{ borderRadius: '50%', border: '2px solid #D6A34A' }} />
          </div>

          <div className="gold-bar">
            {passenger.trip.toUpperCase()}
          </div>

          <h2>YOUR TRAVEL e-TICKET</h2>

          <div className="section">
            <div className="title">
              <img src={logo} alt="Lion" style={{ borderRadius: '50%' }} />
              PASSENGER DETAILS
              <img src={logo} alt="Lion" style={{ borderRadius: '50%' }} />
            </div>

            <div className="rows">
              <div>
                <strong>Passenger(s)</strong>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>{passenger.name}</span>
                  {passenger.additional.map((t, idx) => (
                    <span key={idx} style={{ fontSize: '0.9em', color: '#D6A34A' }}>
                      {t.name}
                    </span>
                  ))}
                </span>
              </div>
              <div>
                <strong>Ticket Number</strong>
                <span>{passenger.ticket}</span>
              </div>
            </div>
          </div>

          <div className="gold-bar">
            YOUR JOURNEY, REIMAGINED
          </div>

          <div className="confirmation">
            Confirmation Code:
            <b>{passenger.confirmation}</b>
          </div>

          <div className="section">
            <div className="title">
              <img src={logo} alt="Lion" style={{ borderRadius: '50%' }} />
              TRAVEL ITINERARY
              <img src={logo} alt="Lion" style={{ borderRadius: '50%' }} />
            </div>

            <div className="rows">
              <div>
                <strong>Date</strong>
                <span>{passenger.date}</span>
              </div>
              <div>
                <strong>Destination</strong>
                <span>{passenger.destination}</span>
              </div>
              <div>
                <strong>Trip Type</strong>
                <span>{passenger.trip}</span>
              </div>
              <div>
                <strong>Travel Modes</strong>
                <span>{passenger.travel}</span>
              </div>
            </div>
          </div>

          <div className="bottom">
            <div className="qr">
              {/* Added explicit background to ensure it renders over the dark map */}
              <div style={{ background: '#FFF', padding: '4px', display: 'inline-block', borderRadius: '4px' }}>
                <QRCode value={passenger.ticket} size={95} fgColor="#051d38" />
              </div>
              <p>
                VALID FOR
                <br />
                {passenger.adults} ADULTS
                {passenger.children > 0 && <><br />{passenger.children} CHILDREN</>}
              </p>
            </div>

            <div className="barcode">
              <div style={{ background: '#FFF', padding: '4px', borderRadius: '4px' }}>
                <Barcode 
                  value={passenger.ticket} 
                  height={50} 
                  width={1.5}
                  displayValue={false} 
                  background="#FFFFFF"
                  lineColor="#051d38"
                />
              </div>
              <div className="signature">
                Travel Agency Signature
                <br />
                <b>{passenger.agency}</b>
              </div>
            </div>
          </div>
          
          <div className="tribal-pattern"></div>
        </div>
      </div>
    </div>
  );
}
