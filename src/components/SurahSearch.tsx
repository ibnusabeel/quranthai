import React, { useState, useMemo } from 'react';
import type { Surah } from '../data/surahs';
import './SurahSearch.css';

interface SurahSearchProps {
    surahs: Surah[];
    availableSurahs: number[]; // Array of surah numbers that have content
    bookSlug: string;
}

export default function SurahSearch({ surahs, availableSurahs, bookSlug }: SurahSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'Makkah' | 'Madinah'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'missing'>('all');

    const availableSet = useMemo(() => new Set(availableSurahs), [availableSurahs]);

    const filteredSurahs = useMemo(() => {
        return surahs.filter((surah) => {
            // 1. Search Query
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                surah.number.toString().includes(query) ||
                surah.nameThai.toLowerCase().includes(query) ||
                surah.nameArabic.includes(query);

            if (!matchesSearch) return false;

            // 2. Type Filter
            if (typeFilter !== 'all' && surah.type !== typeFilter) return false;

            // 3. Status Filter
            const hasContent = availableSet.has(surah.number);
            if (statusFilter === 'available' && !hasContent) return false;
            if (statusFilter === 'missing' && hasContent) return false;

            return true;
        });
    }, [surahs, searchQuery, typeFilter, statusFilter, availableSet]);

    return (
        <div className="surah-search-container">
            <div className="search-header">
                <div className="search-title-row">
                    <h2 className="section-title">สารบัญซูเราะห์ ({filteredSurahs.length} / {surahs.length})</h2>
                </div>

                <div className="search-controls">
                    <div className="search-input-wrapper">
                        <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="ค้นหาซูเราะห์ (ชื่อไทย, อาหรับ, ลำดับ)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="filter-select"
                    >
                        <option value="all">ทุกประเภท</option>
                        <option value="Makkah">มักกียะฮฺ</option>
                        <option value="Madinah">มะดะนียะฮฺ</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="filter-select"
                    >
                        <option value="all">สถานะทั้งหมด</option>
                        <option value="available">มีตัฟซีรแล้ว</option>
                        <option value="missing">ยังไม่มีข้อมูล</option>
                    </select>
                </div>
            </div>

            <div className="surahs-grid">
                {filteredSurahs.length > 0 ? (
                    filteredSurahs.map((surah) => {
                        const hasContent = availableSet.has(surah.number);
                        return (
                            <div key={surah.number} className={`surah-card ${!hasContent ? 'surah-card-disabled' : ''}`}>
                                <div className="surah-card-header">
                                    <div className="surah-number-circle">{surah.number}</div>
                                    <span className={`surah-type-badge ${surah.type === 'Makkah' ? 'badge-makkah' : 'badge-madinah'}`}>
                                        {surah.type === 'Makkah' ? 'มักกียะฮฺ' : 'มะดะนียะฮฺ'}
                                    </span>
                                </div>

                                <div className="surah-card-body">
                                    <h3 className="surah-name-thai">{surah.nameThai}</h3>
                                    <p className="surah-name-arabic text-arabic">{surah.nameArabic}</p>

                                    <div className="surah-info">
                                        <div className="info-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                            </svg>
                                            <span>{surah.ayahCount} อายะฮ์</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="surah-card-footer">
                                    {hasContent ? (
                                        <a href={`/tafsir/${bookSlug}/${surah.number}`} className="btn-read-card">
                                            <span>อ่านตัฟซีร</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7"></path>
                                            </svg>
                                        </a>
                                    ) : (
                                        <div className="no-content-badge">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                            </svg>
                                            <span>ยังไม่มีข้อมูล</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state-full">
                        <div className="empty-icon">🔍</div>
                        <h3>ไม่พบซูเราะห์ที่ค้นหา</h3>
                        <p>ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูล</p>
                    </div>
                )}
            </div>

            <div className="add-more-notice">
                <p>💡 <strong>สำหรับผู้ดูแลระบบ:</strong> <a href="/keystatic" className="cms-link">เข้าสู่ CMS</a> เพื่อเพิ่มเนื้อหาตัฟซีรในซูเราะห์ที่ยังว่างอยู่</p>
            </div>
        </div>
    );
}
