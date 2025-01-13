// UniversityLogoMap.js

import React from 'react';

// Default icon for universities not found in the map
const defaultUniversityIcon = "https://www.example.com/path/to/default-university-icon.png"; // replace with an actual icon URL

// Map of university names to their logo URLs
const universityLogos = new Map([
  ["University of Southern California", "https://identity.usc.edu/wp-content/uploads/2022/09/TheSeal_Reg_0921.png"],
  ["University of Texas at Dallas", "https://upload.wikimedia.org/wikipedia/commons/7/7c/UT_Dallas_2_Color_Emblem_-_SVG_Brand_Identity_File.svg"],
  ["University of Virginia-Main Campus", "https://brand.virginia.edu/logo"],
  ["University of Washington", "https://www.washington.edu/brand/graphic-elements/logo/"],
  ["University of Western Ontario", "https://communications.uwo.ca/comms/brand/visual_identity.html"],
  ["University of the Sciences", "https://www.usciences.edu/marketing-communications/brand-guidelines/index.html"],
  ["University of the West of England, Bristol", "https://www.uwe.ac.uk/about/brand/logo"],
  ["Vanderbilt University", "https://www.vanderbilt.edu/communications/brand/logo/"],
  ["Virginia Polytechnic Institute and State University", "https://brand.vt.edu/visual-identity/brand-architecture/university-logos.html"],
  ["Virginia Tech", "https://brand.vt.edu/visual-identity/brand-architecture/university-logos.html"],
  ["Wake Forest University", "https://brand.wfu.edu/visual-identity/logos/"],
  ["Florida International University", "https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/FIU_Panthers_logo.svg/320px-FIU_Panthers_logo.svg.png"],
  ["The University of Texas Permian Basin", "https://www.utpb.edu/assets/images/icons/210602-newutpblogo-color210506cropped.gif"],
  ["George Washington University", "https://cdn.freelogovectors.net/wp-content/uploads/2023/06/gw_george-washington-university_logo-freelogovectors.net_.png"]
]);

// Function to get the logo URL by university name, or return the default icon if not found
export function getUniversityLogo(universityName) {
  return universityLogos.get(universityName) || defaultUniversityIcon;
}

export default universityLogos;
