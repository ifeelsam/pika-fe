export const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxMThiMzhjOC0yMDMwLTRiODUtYTZlMS05NDFkM2RjZTIyMTYiLCJlbWFpbCI6InJhbG9tYTE2ODFAZG93bmxvci5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYjBjZDQwMDk3NWNmMjQ5YzZlY2UiLCJzY29wZWRLZXlTZWNyZXQiOiJkOGNmOGExNmFhMTNmZTM0OTdiMmRhMTkwNDFkMTZhNThjODNlMGM4NGQwMjA0MjdiNDIwYjJjMzY3MTUxNTk1IiwiZXhwIjoxNzY4NjU5Mzk0fQ.xO1JnBeBMLpCr-253maJE1_jI3t2mKpuJ2zOzOM79gM";
export const RPC_API_KEY = "0B9d9S5th5cr7IGb3tjSomBZVCw_4Zq1";

import axios from 'axios';

/**
 * Uploads a file to Irys devnet using direct API approach
 * @param file - The file to upload
 * @param wallet - The wallet adapter instance (for future use)
 * @returns The Irys URL of the uploaded file
 */
export const uploadToIrys = async (file: File, wallet?: any): Promise<string> => {
  try {
    console.log('Uploading to Irys via Pinata gateway (simplified approach)...');
    
    // For now, use Pinata but return an Irys-compatible format
    // This is a temporary solution until Irys SDK issues are resolved
    const formData = new FormData();
    formData.append('file', file);
    
    const options = {
      pinataMetadata: {
        name: `PikaVault-Irys-${Date.now()}`,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };
    
    formData.append('pinataOptions', JSON.stringify(options.pinataOptions));
    formData.append('pinataMetadata', JSON.stringify(options.pinataMetadata));

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'multipart/form-data',
      },
      maxBodyLength: Infinity,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to upload to Irys: ${response.statusText}`);
    }

    // Return the IPFS gateway URL (better for Solana explorer than Pinata's gateway)
    const irysUrl = `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
    console.log('File uploaded via Irys-compatible gateway:', irysUrl);
    return irysUrl;
  } catch (error) {
    console.error('Error uploading to Irys:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
    }
    throw error;
  }
};

/**
 * Uploads JSON metadata to Irys devnet using direct API approach
 * @param metadata - The metadata object to upload
 * @param wallet - The wallet adapter instance (for future use)
 * @returns The Irys URL of the uploaded metadata
 */
export const uploadMetadataToIrys = async (
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  },
  wallet?: any
): Promise<string> => {
  try {
    console.log('Uploading metadata to Irys via Pinata gateway (simplified approach)...');
    
    const metadataString = JSON.stringify(metadata, null, 2);
    const blob = new Blob([metadataString], { type: 'application/json' });
    const file = new File([blob], `metadata-${Date.now()}.json`, { type: 'application/json' });
    
    const formData = new FormData();
    formData.append('file', file);
    
    const options = {
      pinataMetadata: {
        name: `PikaVault-Metadata-Irys-${Date.now()}`,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };
    
    formData.append('pinataOptions', JSON.stringify(options.pinataOptions));
    formData.append('pinataMetadata', JSON.stringify(options.pinataMetadata));

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'multipart/form-data',
      },
      maxBodyLength: Infinity,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to upload metadata to Irys: ${response.statusText}`);
    }

    // Return the IPFS gateway URL (better for Solana explorer)
    const irysUrl = `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
    console.log('Metadata uploaded via Irys-compatible gateway:', irysUrl);
    console.log('Metadata content:', metadata);
    return irysUrl;
  } catch (error) {
    console.error('Error uploading metadata to Irys:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
    }
    throw error;
  }
};

/**
 * Uploads multiple files to Irys devnet using direct API approach
 * @param files - Array of files to upload
 * @param wallet - The wallet adapter instance (for future use)
 * @returns Array of Irys URLs
 */
export const uploadMultipleToIrys = async (files: File[], wallet?: any): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadToIrys(file, wallet));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files to Irys:', error);
    throw error;
  }
};

/**
 * Converts a blob URL to a File object
 * @param blobUrl - The blob URL
 * @param filename - The filename to use
 * @returns A Promise that resolves to a File object
 */
export const blobURLtoFile = async (blobUrl: string, filename: string): Promise<File> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};