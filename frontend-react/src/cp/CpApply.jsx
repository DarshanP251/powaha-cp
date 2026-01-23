import { useState } from 'react';
import api from '../api/api';
import districts from '../data/districts.json';
import '../styles/auth.css';

export default function CpApply() {
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', city: '', state: '', country: 'India', background: '', experience: '', password: '', declaration: false, preferred_aoo: []
  });
  const [message, setMessage] = useState('');
  const [districtSearch, setDistrictSearch] = useState("");
  const filteredDistricts = districts.filter(d => {
    const name = d?.District || "";
    return name.toLowerCase().includes(districtSearch.toLowerCase());
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function handleAooChange(e) {
    const options = Array.from(e.target.selectedOptions).map(o => o.value);
    setForm(f => ({ ...f, preferred_aoo: options }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.declaration) {
      setMessage('You must accept the declaration');
      return;
    }
    try {
      // Only send required fields for backend
      const payload = {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        city: form.city,
        state: form.state,
        country: form.country,
        background: form.background,
        experience: form.experience,
        preferred_aoo: form.preferred_aoo
      };
      const res = await api.post('/auth/cp/apply', payload);
      localStorage.setItem('lastAppliedEmail', form.email);
      setMessage(res.data.message || 'Application submitted successfully. Await admin approval.');
      setForm({
        name: '', email: '', mobile: '', city: '', state: '', country: 'India', background: '', experience: '', password: '', declaration: false, preferred_aoo: []
      });
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Application failed');
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Community Partner Application</h2>
          <p className="auth-subtitle">Fill in your details to apply</p>
          <div className="auth-section">
            <h4>Basic Information</h4>
            <div className="auth-grid-2">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className="auth-input" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className="auth-input" />
              <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile Number" required className="auth-input" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City / District" required className="auth-input" />
              <input name="state" value={form.state} onChange={handleChange} placeholder="State" required className="auth-input" />
              <input name="country" value={form.country} readOnly className="auth-input" />
            </div>
          </div>
          <div className="auth-section">
            <h4>Background</h4>
            <div className="auth-grid-2">
              <textarea name="background" value={form.background} onChange={handleChange} placeholder="Church / Community Background" rows={4} className="auth-textarea" />
              <textarea name="experience" value={form.experience} onChange={handleChange} placeholder="Experience (sales / ministry / community work)" rows={4} className="auth-textarea" />
            </div>
          </div>
          <div className="auth-section">
            <h4>Preferred Area of Operation</h4>
            <input
              type="text"
              placeholder="Search district..."
              value={districtSearch}
              onChange={e => setDistrictSearch(e.target.value)}
              className="auth-input"
            />
            <select
              multiple
              className="auth-district-select"
              value={form.preferred_aoo}
              onChange={handleAooChange}
            >
              {filteredDistricts.map((district, idx) => {
                const name = district?.District || "";
                return <option key={idx} value={name}>{name}</option>;
              })}
            </select>
          </div>
          <div className="auth-section">
            <h4>Account Setup</h4>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create Password" required className="auth-input" />
          </div>
          <div className="auth-declaration-row">
            <input type="checkbox" name="declaration" checked={form.declaration} onChange={handleChange} />
            <span>I declare that the information provided is true and accurate to the best of my knowledge</span>
          </div>
          <button type="submit" className="auth-primary-btn">Submit Application</button>
        </form>
        {message && <p className="auth-info-text error">{message}</p>}
      </div>
    </div>
  );
}
