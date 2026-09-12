import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RecentScans from '../components/RecentScans';
import { getScans, deleteScan } from '../services/api';

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await getScans();
        if (response.success) {
          setScans(response.scans);
        }
      } catch (error) {
        console.error('Error fetching scans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scan?')) {
      try {
        await deleteScan(id);
        setScans(scans.filter(scan => scan._id !== id));
      } catch (error) {
        console.error('Error deleting scan:', error);
      }
    }
  };

  return (
    <div>
      <Navbar title="Scan History" subtitle="View all past AI diagnostics and intelligence reports." />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <RecentScans scans={scans} loading={loading} hideViewAll={true} onDelete={handleDelete} />
      </div>
    </div>
  );
}
