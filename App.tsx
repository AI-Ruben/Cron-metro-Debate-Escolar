
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Language, Team, TimerState, Timers, TimerLog, TimerLogs } from './types';
import { TRANSLATIONS, TIMER_CONFIGS } from './constants';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const formatTime = (totalSeconds: number): string => {
  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  const sign = isNegative ? '-' : '';
  return `${sign}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatSpokenTime = (totalSeconds: number, translations: typeof TRANSLATIONS[Language]): string => {
  const absSeconds = Math.abs(totalSeconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  
  const parts = [];
  if (mins > 0) {
    parts.push(`${mins} ${mins === 1 ? translations.minute : translations.minutes}`);
  }
  if (secs > 0 || mins === 0) {
    parts.push(`${secs} ${secs === 1 ? translations.second : translations.seconds}`);
  }

  if (parts.length === 0) {
    return `0 ${translations.seconds}`;
  }
  
  return parts.join(` ${translations.and} `);
};

const MaximizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
  </svg>
);

const MinimizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
  </svg>
);


const Header: React.FC<{
  lang: Language;
  setLang: (lang: Language) => void;
  translations: typeof TRANSLATIONS[Language];
}> = ({ lang, setLang, translations }) => {
  const languages: Language[] = ['es', 'en', 'eu'];
  const focusRingClass = "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3E8484]";

  return (
    <header className="text-center bg-white p-5 rounded-2xl mb-8 shadow-lg max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-[#5B4A9E] mb-2 tracking-wide">{translations.mainTitle}</h1>
      <h2 className="text-2xl md:text-3xl font-normal text-[#4A9E9E] mb-4">{translations.subtitle}</h2>
      <div className="flex justify-center gap-2 mt-4">
        {languages.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-current={lang === l ? 'page' : undefined}
            className={`px-5 py-2 rounded-md font-bold text-white transition-all duration-300 transform hover:scale-105 ${focusRingClass} ${
              lang === l ? 'bg-[#3E8484]' : 'bg-[#5B4A9E] hover:bg-[#3E8484]'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
};

const ConfigPanel: React.FC<{
  onStart: (teamA: string, teamB: string) => void;
  translations: typeof TRANSLATIONS[Language];
}> = ({ onStart, translations }) => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const focusRingClass = "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3E8484]";

  const handleStart = () => {
    if (teamA.trim() && teamB.trim()) {
      onStart(teamA.trim(), teamB.trim());
    } else {
      alert(translations.enterNames);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold text-[#5B4A9E] mb-6 text-center">{translations.configTitle}</h3>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col">
          <label htmlFor="teamA-input" className="text-lg font-bold text-[#5B4A9E] mb-2">{translations.labelTeamA}</label>
          <input
            id="teamA-input"
            type="text"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            placeholder={translations.placeholderA}
            className={`p-3 border-2 border-[#5B4A9E] rounded-md focus:ring-[#4A9E9E] transition ${focusRingClass}`}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="teamB-input" className="text-lg font-bold text-[#5B4A9E] mb-2">{translations.labelTeamB}</label>
          <input
            id="teamB-input"
            type="text"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            placeholder={translations.placeholderB}
            className={`p-3 border-2 border-[#5B4A9E] rounded-md focus:ring-[#4A9E9E] transition ${focusRingClass}`}
          />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleStart}
          className={`px-8 py-4 bg-gradient-to-r from-[#5B4A9E] to-[#3E8484] text-white font-bold text-xl rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${focusRingClass}`}
        >
          {translations.startDebate}
        </button>
      </div>
    </div>
  );
};

const SummaryScreen: React.FC<{
  timerLogs: TimerLogs;
  teamNames: { A: string; B: string };
  translations: typeof TRANSLATIONS[Language];
  onExport: () => void;
  onReset: () => void;
}> = ({ timerLogs, teamNames, translations, onExport, onReset }) => {
  const focusRingClass = "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3E8484]";
  
  const handleExportPDF = async () => {
    const element = document.getElementById('summary-content');
    if (!element) return;

    try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        
        const ratio = imgProps.width / imgProps.height;
        let finalWidth = pdfWidth - 20; // 10mm margin each side
        let finalHeight = finalWidth / ratio;
        
        // If height exceeds page, fit by height
        if (finalHeight > (pdfHeight - 20)) {
            finalHeight = pdfHeight - 20;
            finalWidth = finalHeight * ratio;
        }

        const x = (pdfWidth - finalWidth) / 2;
        const y = 10; // 10mm top margin

        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
        pdf.save(`debate_results_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error("Error generating PDF", error);
        alert("Error generating PDF");
    }
  };

  const renderTeamResults = (team: Team) => {
    const teamConfigs = TIMER_CONFIGS.filter(c => c.team === team);
    const totalTimeUsed = teamConfigs.reduce((sum, config) => sum + timerLogs[config.id].timeUsed, 0);
    const totalOvertime = teamConfigs.reduce((sum, config) => sum + timerLogs[config.id].overtime, 0);
    const totalCombined = totalTimeUsed + totalOvertime;
    const teamId = `team-summary-${team}`;

    return (
      <section aria-labelledby={teamId} className="flex-1 bg-gray-50 p-4 md:p-6 rounded-xl shadow-md min-w-[280px]">
        <h3 id={teamId} className="text-3xl font-bold text-[#5B4A9E] mb-4 text-center">{teamNames[team]}</h3>
        <div className="space-y-3">
          {teamConfigs.map(config => {
            const log = timerLogs[config.id];
            return (
              <div key={config.id} className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <p className="font-bold text-lg text-gray-700">{translations[config.id as keyof typeof translations]}</p>
                <div className="flex justify-between text-base mt-1">
                  <span className="text-gray-500">{translations.timeUsed}:</span>
                  <span className="font-mono font-semibold">{formatTime(log.timeUsed)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-500">{translations.overtime}:</span>
                  <span className={`font-mono font-semibold ${log.overtime > 0 ? 'text-red-500' : ''}`}>{formatTime(log.overtime)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t-2 border-dashed border-[#5B4A9E]">
            <div className="flex justify-between font-bold text-xl">
                <span>{translations.totalTime}:</span>
                <span className="font-mono">{formatTime(totalTimeUsed)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl">
                <span>{translations.totalOvertime}:</span>
                <span className={`font-mono ${totalOvertime > 0 ? 'text-red-500' : ''}`}>{formatTime(totalOvertime)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl mt-3 text-[#3E8484] border-t pt-2 border-gray-200">
                <span>{translations.totalCombinedTime}:</span>
                <span className="font-mono">{formatTime(totalCombined)}</span>
            </div>
        </div>
      </section>
    );
  };

  return (
    <main className="max-w-4xl mx-auto">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl">
        <div id="summary-content" className="p-4 bg-white rounded-xl">
            <h2 className="text-4xl md:text-5xl text-center font-bold text-[#5B4A9E] mb-8">{translations.debateResults}</h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8">
            {renderTeamResults('A')}
            {renderTeamResults('B')}
            </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button onClick={onExport} className={`px-8 py-4 bg-[#6080A3] hover:bg-[#4d6782] text-white font-bold text-xl rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${focusRingClass}`}>
            {translations.export}
          </button>
          <button onClick={handleExportPDF} className={`px-8 py-4 bg-[#7c7c7e] hover:bg-[#636364] text-white font-bold text-xl rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${focusRingClass}`}>
            {translations.exportPDF}
          </button>
          <button onClick={onReset} className={`px-8 py-4 bg-gradient-to-r from-[#5B4A9E] to-[#3E8484] text-white font-bold text-xl rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${focusRingClass}`}>
            {translations.newDebate}
          </button>
        </div>
      </div>
    </main>
  );
};


const initialTimersState = TIMER_CONFIGS.reduce((acc, config) => {
  acc[config.id] = {
    seconds: config.defaultMinutes * 60,
    initialSeconds: config.defaultMinutes * 60,
    warningSeconds: config.defaultWarning,
    isRunning: false,
  };
  return acc;
}, {} as Timers);

const initialTimerLogsState = TIMER_CONFIGS.reduce((acc, config) => {
  acc[config.id] = {
    phase: config.id,
    team: config.team,
    initialTime: config.defaultMinutes * 60,
    timeUsed: 0,
    overtime: 0,
    completed: false
  };
  return acc;
}, {} as TimerLogs);


const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('es');
  const [debateStarted, setDebateStarted] = useState(false);
  const [debateFinished, setDebateFinished] = useState(false);
  const [teamNames, setTeamNames] = useState<{ A: string; B: string }>({ A: '', B: '' });
  const [activeTimerId, setActiveTimerId] = useState<string>(TIMER_CONFIGS[0].id);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [timers, setTimers] = useState<Timers>(initialTimersState);
  const [timerLogs, setTimerLogs] = useState<TimerLogs>(initialTimerLogsState);
  const [srAnnouncement, setSrAnnouncement] = useState('');

  const translations = useMemo(() => TRANSLATIONS[lang], [lang]);
  const isAnyTimerRunning = useMemo(() => Object.keys(timers).some(key => timers[key].isRunning), [timers]);
  const focusRingClass = "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3E8484]";

  const handleStartDebate = useCallback((teamA: string, teamB: string) => {
    setTeamNames({ A: teamA, B: teamB });
    setDebateStarted(true);
  }, []);

  const handleFinishDebate = () => {
    setTimers(prev => {
      const newTimers = { ...prev };
      for (const id in newTimers) {
        newTimers[id].isRunning = false;
      }
      return newTimers;
    });
    setDebateFinished(true);
  };

  const handleResetApp = () => {
    setDebateStarted(false);
    setDebateFinished(false);
    setTeamNames({ A: '', B: '' });
    setActiveTimerId(TIMER_CONFIGS[0].id);
    setTimers(initialTimersState);
    setTimerLogs(initialTimerLogsState);
    setIsFullScreen(false);
  };

  const updateTimerAndLog = useCallback((timerId: string, newSeconds: number) => {
    const timer = timers[timerId];
    const initialSeconds = timer.initialSeconds;
    
    let timeUsed = 0;
    let overtime = 0;

    if(newSeconds >= 0){
      timeUsed = initialSeconds - newSeconds;
    } else {
      timeUsed = initialSeconds;
      overtime = Math.abs(newSeconds);
    }

    setTimers(prev => ({
      ...prev,
      [timerId]: { ...prev[timerId], seconds: newSeconds }
    }));

    setTimerLogs(prev => ({
      ...prev,
      [timerId]: { ...prev[timerId], timeUsed, overtime }
    }));

    if (newSeconds > 0 && newSeconds === timer.warningSeconds) {
      setSrAnnouncement(`${formatSpokenTime(newSeconds, translations)}. ${translations.warningMessage}`);
    } else if (newSeconds === 0) {
      const teamName = teamNames[TIMER_CONFIGS.find(c => c.id === timerId)!.team];
      setSrAnnouncement(`${translations.timeFinished} ${teamName}.`);
      setTimerLogs(prev => ({...prev, [timerId]: {...prev[timerId], completed: true }}));
    } else if (newSeconds < 0 && newSeconds % 30 === 0 && newSeconds !== 0) {
      setSrAnnouncement(`${translations.overtime}: ${formatSpokenTime(Math.abs(newSeconds), translations)}`);
    }
  }, [timers, teamNames, translations]);

  useEffect(() => {
    if (!debateStarted) return;
    const config = TIMER_CONFIGS.find(c => c.id === activeTimerId)!;
    const phaseName = translations[config.id as keyof typeof translations];
    const teamName = teamNames[config.team];
    setSrAnnouncement(`${phaseName}, ${teamName}.`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimerId, debateStarted, teamNames, translations]);

  useEffect(() => {
    if (!isAnyTimerRunning) return;

    const interval = setInterval(() => {
      for (const id in timers) {
        if (timers[id].isRunning) {
          updateTimerAndLog(id, timers[id].seconds - 1);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnyTimerRunning, timers, updateTimerAndLog]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);
  
  const handleTimerControl = useCallback((id: string, action: 'start' | 'pause' | 'reset') => {
    setTimers(prev => {
      const newTimers = { ...prev };
      Object.keys(newTimers).forEach(timerId => {
        if (timerId !== id) {
            newTimers[timerId].isRunning = false;
        }
      });

      if (action === 'start') {
        newTimers[id] = { ...newTimers[id], isRunning: true };
      } else if (action === 'pause') {
        newTimers[id] = { ...newTimers[id], isRunning: false };
      } else if (action === 'reset') {
        newTimers[id] = { ...newTimers[id], seconds: newTimers[id].initialSeconds, isRunning: false };
        setTimerLogs(prevLogs => ({ ...prevLogs, [id]: { ...prevLogs[id], timeUsed: 0, overtime: 0, completed: false } }));
      }
      return newTimers;
    });
  }, []);
  
  const handleTimeSettingChange = useCallback((id: string, type: 'initial' | 'warning', value: number) => {
    setTimers(prev => {
        const newTimerState = {...prev[id]};
        if(type === 'initial') {
            newTimerState.initialSeconds = value * 60;
            if(!newTimerState.isRunning) {
                newTimerState.seconds = value * 60;
            }
            setTimerLogs(prevLogs => ({ ...prevLogs, [id]: { ...prevLogs[id], initialTime: value * 60 } }));
        } else {
            newTimerState.warningSeconds = value;
        }
        return { ...prev, [id]: newTimerState };
    });
  }, []);

  const exportToCSV = useCallback(() => {
    const now = new Date();
    const timestamp = now.toLocaleString(lang);
    let csv = `Fase,Equipo/participante,Tiempo inicial (seg),Tiempo usado (seg),Tiempo extra (seg),${translations.completed}\n`;

    TIMER_CONFIGS.forEach(config => {
      const log = timerLogs[config.id];
      const phaseName = translations[config.id as keyof typeof translations];
      const teamName = teamNames[config.team];
      const completed = log.completed ? translations.yes : translations.no;
      csv += `"${phaseName}","${teamName}",${log.initialTime},${log.timeUsed},${log.overtime},"${completed}"\n`;
    });
    
    csv += '\n';

    (['A', 'B'] as Team[]).forEach(team => {
        const teamName = teamNames[team];
        const teamTimers = TIMER_CONFIGS.filter(c => c.team === team);
        const totalTime = teamTimers.reduce((sum, config) => sum + timerLogs[config.id].timeUsed, 0);
        const totalOvertime = teamTimers.reduce((sum, config) => sum + timerLogs[config.id].overtime, 0);
        csv += `"Total ${teamName}","${teamName}",,${totalTime},${totalOvertime},\n`;
    });

    csv += `\n"Fecha/Hora","${timestamp}"\n`;
    csv += `"Idioma","${lang.toUpperCase()}"\n`;

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `cronometro_debate_${now.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }, [timerLogs, teamNames, lang, translations]);

  const activeTimer = timers[activeTimerId];
  const activeConfig = TIMER_CONFIGS.find(c => c.id === activeTimerId)!;
  
  const getTimerDisplayClass = (timer: TimerState) => {
    if (timer.seconds < 0) return 'text-red-600 animate-pulse';
    if (timer.seconds > 0 && timer.seconds <= timer.warningSeconds) return 'text-yellow-500';
    return 'text-[#4A9E9E]';
  };

  const getProgressBarClass = (timer: TimerState) => {
    if (timer.seconds <= 0) return 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_15px_rgba(220,38,38,0.6)]';
    if (timer.seconds <= timer.warningSeconds) return 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]';
    return 'bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]';
  };

  const progressPercentage = useMemo(() => {
    if (activeTimer.initialSeconds <= 0) return 0;
    return Math.max(0, (activeTimer.seconds / activeTimer.initialSeconds) * 100);
  }, [activeTimer.seconds, activeTimer.initialSeconds]);

  return (
    <div className="bg-gradient-to-br from-[#5B4A9E] to-[#4A9E9E] min-h-screen p-4 md:p-8 text-gray-800">
      <Header lang={lang} setLang={setLang} translations={translations} />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>
      {!debateStarted ? (
        <ConfigPanel onStart={handleStartDebate} translations={translations} />
      ) : !debateFinished ? (
        <main className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                {TIMER_CONFIGS.map(config => (
                    <button 
                        key={config.id} 
                        onClick={() => setActiveTimerId(config.id)}
                        aria-pressed={activeTimerId === config.id}
                        className={`px-4 py-2 text-sm md:text-base font-bold rounded-lg border-2 transition-all duration-300 ${focusRingClass} ${activeTimerId === config.id ? 'bg-gradient-to-r from-[#5B4A9E] to-[#3E8484] text-white border-transparent' : 'bg-white text-[#5B4A9E] border-[#5B4A9E] hover:bg-[#5B4A9E] hover:text-white'}`}
                    >
                        {translations[config.id as keyof typeof translations]}
                    </button>
                ))}
            </div>

            <div className={`bg-white transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 h-screen w-screen flex flex-col justify-between p-4 md:p-12 overflow-y-auto' : 'p-6 md:p-8 rounded-2xl shadow-2xl relative'}`}>
                <button 
                   onClick={() => setIsFullScreen(!isFullScreen)}
                   className="absolute top-4 right-4 p-2 text-[#5B4A9E] hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3E8484]"
                   title={isFullScreen ? translations.exitFullScreen : translations.fullScreen}
                   aria-label={isFullScreen ? translations.exitFullScreen : translations.fullScreen}
                >
                   {isFullScreen ? <MinimizeIcon /> : <MaximizeIcon />}
                </button>

                <div className={`${isFullScreen ? 'flex-1 flex flex-col justify-center' : ''}`}>
                  <h2 className={`font-bold text-[#5B4A9E] text-center transition-all duration-300 ${isFullScreen ? 'text-4xl md:text-6xl mb-4' : 'text-3xl'}`}>
                    {translations[activeConfig.id as keyof typeof translations]}
                  </h2>
                  <p className={`font-semibold italic text-[#4A9E9E] text-center mb-4 transition-all duration-300 ${isFullScreen ? 'text-3xl md:text-5xl' : 'text-xl'}`}>
                    {teamNames[activeConfig.team]}
                  </p>
                  
                  <div 
                    role="timer" 
                    aria-live="off" 
                    className={`leading-none text-center font-bold my-4 transition-all duration-300 ${getTimerDisplayClass(activeTimer)} ${isFullScreen ? 'text-[25vw] md:text-[30vh]' : 'text-9xl md:text-[11rem] my-8'}`} 
                    style={{fontVariantNumeric: 'tabular-nums'}}
                  >
                      {formatTime(activeTimer.seconds)}
                  </div>

                  <div className={`w-full bg-gray-100 rounded-full p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 ${isFullScreen ? 'h-12 md:h-16 mb-12 max-w-[80vw] mx-auto' : 'h-8 mb-8'}`}>
                      <div
                          className={`h-full rounded-full transition-all duration-1000 ease-linear relative overflow-hidden ${getProgressBarClass(activeTimer)}`}
                          style={{ width: `${progressPercentage}%` }}
                          role="progressbar"
                          aria-valuenow={activeTimer.seconds}
                          aria-valuemin={0}
                          aria-valuemax={activeTimer.initialSeconds}
                          aria-label="Time remaining"
                      >
                         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent"></div>
                      </div>
                  </div>
                </div>

                <div className={`flex flex-col items-center gap-4 ${isFullScreen ? 'mb-8 scale-110' : 'mb-8'}`}>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-[#5B4A9E]">
                        <div className="flex items-center gap-3">
                            <label htmlFor={`${activeTimerId}-initial-minutes`} className="font-bold text-lg whitespace-nowrap">{translations.initialMinutes}</label>
                            <input id={`${activeTimerId}-initial-minutes`} type="number" value={Math.round(activeTimer.initialSeconds / 60)} onChange={(e) => handleTimeSettingChange(activeTimerId, 'initial', parseInt(e.target.value))} min="1" max="60" className={`w-20 p-2 text-center border-2 border-[#5B4A9E] rounded-md ${focusRingClass}`}/>
                        </div>
                        <div className="flex items-center gap-3">
                            <label htmlFor={`${activeTimerId}-warning-seconds`} className="font-bold text-lg whitespace-nowrap">{translations.warningSeconds}</label>
                            <input id={`${activeTimerId}-warning-seconds`} type="number" value={activeTimer.warningSeconds} onChange={(e) => handleTimeSettingChange(activeTimerId, 'warning', parseInt(e.target.value))} min="5" max="300" className={`w-20 p-2 text-center border-2 border-[#5B4A9E] rounded-md ${focusRingClass}`}/>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        <button onClick={() => handleTimerControl(activeTimerId, activeTimer.isRunning ? 'pause' : 'start')} className={`w-32 px-6 py-3 bg-gradient-to-r from-[#5B4A9E] to-[#3E8484] text-white font-bold text-lg rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${focusRingClass}`}>
                            {activeTimer.isRunning ? translations.pause : translations.start}
                        </button>
                        <button onClick={() => handleTimerControl(activeTimerId, 'reset')} className={`w-32 px-6 py-3 bg-gradient-to-r from-[#5B4A9E] to-[#3E8484] text-white font-bold text-lg rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${focusRingClass}`}>
                            {translations.reset}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
                 <button onClick={exportToCSV} className={`px-6 py-3 bg-[#6080A3] hover:bg-[#4d6782] text-white font-bold text-lg rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${focusRingClass}`}>
                    {translations.export}
                </button>
                <button onClick={handleFinishDebate} className={`px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${focusRingClass}`}>
                    {translations.finishDebate}
                </button>
            </div>
        </main>
      ) : (
         <SummaryScreen
            timerLogs={timerLogs}
            teamNames={teamNames}
            translations={translations}
            onExport={exportToCSV}
            onReset={handleResetApp}
        />
      )}
    </div>
  );
};

export default App;
