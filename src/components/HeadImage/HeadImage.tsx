import Box from "@mui/material/Box";
import React from "react";

interface HeadImage {
    src: string
}

export const HeadImage: React.FC<HeadImage> = ({src}) => {
    return <>
        <Box width='100%' height={200} sx={{ overflow: 'hidden' }}>
            <img src={src} width='100%' height={200} style={{ objectFit: 'cover' }}></img>
        </Box>
    </>
}