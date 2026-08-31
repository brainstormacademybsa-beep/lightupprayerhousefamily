/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface SiteBranding {
  logoUrl: string;
  siteName: string;
  tagline: string;
  updatedAt?: string;
}

export const DEFAULT_BRANDING: SiteBranding = {
  logoUrl: '/logo.jpg',
  siteName: 'LIGHT UP PRAYER HOUSE',
  tagline: 'Family Outreach',
};

/**
 * Custom React hook that subscribes to real-time site branding changes in Firestore.
 */
export function useSiteBranding(): SiteBranding {
  const [branding, setBranding] = useState<SiteBranding>(DEFAULT_BRANDING);

  useEffect(() => {
    try {
      const docRef = doc(db, 'settings', 'branding');
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<SiteBranding>;
          setBranding({
            logoUrl: data.logoUrl?.trim() || DEFAULT_BRANDING.logoUrl,
            siteName: data.siteName?.trim() || DEFAULT_BRANDING.siteName,
            tagline: data.tagline?.trim() || DEFAULT_BRANDING.tagline,
            updatedAt: data.updatedAt,
          });
        } else {
          setBranding(DEFAULT_BRANDING);
        }
      }, (err) => {
        console.warn('Error listening to site branding changes:', err);
        setBranding(DEFAULT_BRANDING);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore branding subscription error:', err);
      setBranding(DEFAULT_BRANDING);
    }
  }, []);

  return branding;
}

/**
 * Updates site branding (Logo URL, Site Name, Tagline) in Firestore.
 */
export async function updateSiteBranding(newBranding: Partial<SiteBranding>): Promise<void> {
  const docRef = doc(db, 'settings', 'branding');
  await setDoc(docRef, {
    logoUrl: newBranding.logoUrl?.trim() || DEFAULT_BRANDING.logoUrl,
    siteName: newBranding.siteName?.trim() || DEFAULT_BRANDING.siteName,
    tagline: newBranding.tagline?.trim() || DEFAULT_BRANDING.tagline,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}
