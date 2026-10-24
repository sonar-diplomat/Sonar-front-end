import React from 'react';

import { Link } from 'react-router-dom';
export const TestPage = () => <main style={{ padding: 24, display: 'grid', gap: 16 }}>
    <h1>Sonar diagnostics</h1><p>Inspect the shared read-only transport or return to the catalog.</p>
    <Link to="/test/api">API diagnostics</Link><Link to="/home">Home</Link>
</main>;
