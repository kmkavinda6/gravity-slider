import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import React from "react";

const Particle = () => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        console.log("init");
        initParticlesEngine(async (engine) => {
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = (container) => {};

    return (
        <>
            {init && (
                <Particles
                    id="tsparticles"
                    particlesLoaded={particlesLoaded}
                    style={{ zIndex: 1 }}
                    options={{
                        fpsLimit: 120,
                        interactivity: {
                            events: {
                                onClick: { enable: true, mode: "push" },
                                onHover: { enable: true, mode: "repulse" },
                                resize: true,
                            },
                            modes: {
                                push: { quantity: 5 },
                                repulse: { distance: 200, duration: 0.3 },
                            },
                        },
                        particles: {
                            color: { value: "#ffffff" },
                            links: {
                                color: "#ffffff",
                                distance: 230,
                                enable: true,
                                opacity: 1,
                                width: 1,
                            },
                            move: {
                                direction: "none",
                                enable: true,
                                outModes: { default: "bounce" },
                                random: false,
                                speed: 1.5,
                                straight: false,
                            },
                            number: {
                                density: { enable: true, area: 800 },
                                value: 160,
                            },
                            opacity: { value: 1 },
                            shape: { type: "circle" },
                            size: { value: { min: 1, max: 5 } },
                        },
                        detectRetina: true,
                    }}
                />
            )}
        </>
    );
};

export default React.memo(Particle);