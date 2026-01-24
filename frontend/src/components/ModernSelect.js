// frontend/src/components/ModernSelect.js
import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaSearch, FaCheck } from 'react-icons/fa';
import '../styles/_modernSelect.scss';

export default function ModernSelect({
    options = [],
    value,
    onChange,
    placeholder = "Seleccionar...",
    labelField = 'label',
    valueField = 'id',
    icon,
    searchable = false,
    className = "",
    disabled = false,
    id
}) {

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);

    useEffect(() => {
        const handleOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        window.addEventListener('mousedown', handleOutside);
        return () => window.removeEventListener('mousedown', handleOutside);
    }, []);

    const selectedOption = options.find(o => String(o[valueField]) === String(value));

    const filtered = options.filter(o =>
        String(o[labelField] || '').toLowerCase().includes(search.toLowerCase())
    );

    const toggle = () => {
        if (disabled) return;
        setOpen(!open);
        if (!open) setSearch(""); // Reset search when opening
    };

    return (

        <div className={`modern-select-container ${className} ${open ? 'is-open' : ''} ${disabled ? 'disabled' : ''}`} ref={containerRef}>
            <div
                id={id}
                className="modern-select-trigger"
                onClick={toggle}
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={id ? `${id}-listbox` : undefined}
            >

                {icon && <span className="trigger-icon">{icon}</span>}
                <span className={`trigger-text ${!selectedOption ? 'placeholder' : ''}`}>
                    {selectedOption ? selectedOption[labelField] : placeholder}
                </span>
                <FaChevronDown className={`chevron ${open ? 'up' : ''}`} />
            </div>

            {open && (
                <div className="modern-select-dropdown">
                    {searchable && (
                        <div className="search-wrap">
                            <FaSearch className="si" />
                            <input
                                placeholder="Buscar..."
                                aria-label="Buscar opciones"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />

                        </div>
                    )}
                    <div id={id ? `${id}-listbox` : undefined} className="options-scroll" role="listbox">
                        {filtered.length > 0 ? filtered.map(opt => (
                            <div
                                key={opt[valueField]}
                                className={`option-item ${String(opt[valueField]) === String(value) ? 'selected' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(opt[valueField]);
                                    setOpen(false);
                                    setSearch("");
                                }}
                            >
                                <div className="opt-content">
                                    {opt.icon && <span className="opt-icon">{opt.icon}</span>}
                                    <span>{opt[labelField]}</span>
                                </div>
                                {String(opt[valueField]) === String(value) && <FaCheck className="check" />}
                            </div>
                        )) : (
                            <div className="no-options">Sin resultados</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
