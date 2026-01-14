'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { SteamGame } from '@/lib/steam-types';

interface SteamGameImageProps extends Omit<ImageProps, 'src' | 'alt'> {
    game: SteamGame;
    alt: string;
    imageType?: 'header' | 'hero' | 'capsule';
}

export default function SteamGameImage({ game, alt, imageType = 'header', ...props }: SteamGameImageProps) {
    // Construct URL based on type
    const getUrl = (type: string) => {
        const baseUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}`;
        switch (type) {
            case 'hero': return `${baseUrl}/library_hero.jpg`;
            case 'capsule': return `${baseUrl}/capsule_616x353.jpg`;
            case 'header': default: return `${baseUrl}/header.jpg`;
        }
    };

    const mainUrl = getUrl(imageType);

    const [src, setSrc] = useState<string>(mainUrl);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        // If current src is Hero, try Header
        if (imageType === 'hero' && src === mainUrl) {
            setSrc(getUrl('header'));
            return;
        }

        // If current is Header (or Hero failed to Header), try Icon fallback
        if ((src === mainUrl || src === getUrl('header')) && game.img_icon_url) {
            setSrc(`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`);
        } else {
            setHasError(true);
        }
    };

    if (hasError) {
        return (
            <div className={`flex items-center justify-center bg-gray-800 text-gray-500 font-medium p-4 text-center text-xs ${props.className}`} style={{ height: '100%', width: '100%' }}>
                <span className="line-clamp-2">{game.name}</span>
            </div>
        );
    }

    return (
        <Image
            {...props}
            src={src}
            alt={alt}
            onError={handleError}
            unoptimized
        />
    );
}
