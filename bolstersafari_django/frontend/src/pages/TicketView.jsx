import ETicket from '../components/ETicket';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export default function TicketView() {
  const { bookingRef } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['bookingTicket', bookingRef, email],
    queryFn: async () => {
      const res = await apiClient.get(`/bookings/${bookingRef}/?email=${encodeURIComponent(email)}`);
      return res.data;
    },
    enabled: !!bookingRef // only run if we have a bookingRef
  });

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading Ticket...</div>;
  
  if (isError) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Could not load ticket details.</div>;

  // If preview mode (no bookingRef), pass undefined to use default mock data
  const ticketData = booking ? {
    booking_ref: booking.booking_ref,
    customer_name: booking.customer_name,
    trip_title: booking.trip_title,
    destinations: booking.destinations,
    date: booking.date,
    travel_modes: booking.travel_modes,
    adults: booking.number_of_people,
    children: 0, // Children logic not fully implemented yet in booking
    confirmation_code: booking.id.split('-')[0].toUpperCase(),
    additional_travelers: booking.additional_travelers || []
  } : undefined;

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 0' }}>
      <ETicket booking={ticketData} />
    </div>
  );
}
