import { nanoid } from "nanoid";
import { Presk as VanillaPresk } from "@presk/core";
import { useEffect, useRef } from "react";

function Presk({ options, fps }: { options?: unknown, fps?: number }) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const preskRef = useRef<VanillaPresk | null>(null);
    const pendingOptionsRef = useRef<unknown | null>(null);

    useEffect(() => {
        //create a Presk instance and destroy it when the component is unmounted
        const rootElement = rootRef.current;
        if (!rootElement) return;
        const rootId = nanoid();
        rootElement.id = rootId;

        let unMounted = false;

        (async () => {
            const presk = await VanillaPresk.create({
                root: `#${rootId}`,
                fps: fps || 60,
            });

            if (unMounted) {
                await presk.destroy();
                return;
            }
            else {
                preskRef.current = presk;
                if (pendingOptionsRef.current) {
                    await presk.load(pendingOptionsRef.current);
                }
            }
        })();

        return () => {
            unMounted = true;
            const presk = preskRef.current;
            if (presk) {
                (async ()=>{await presk.destroy()})();
            }
        };
    }, []);

    useEffect(() => {
        //Load the document into the Presk instance when the options prop changes
        (async () => {
            const presk = preskRef.current;
            if (presk) {
                    pendingOptionsRef.current = null;
                    await presk.load(options);
            }
            else {
                pendingOptionsRef.current = options;
            }
        })();
    }, [options]);

    return (
        <div ref={rootRef} className="presk_root"></div>
    );
}

export default Presk;