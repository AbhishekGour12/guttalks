"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function TawkTo() {
  

  return (
    <Script id="tawk-to" strategy="afterInteractive">
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
          var s1=document.createElement("script"),
          s0=document.getElementsByTagName("script")[0];
          
          s1.async=true;
          s1.src='https://embed.tawk.to/69f87ef3d21eb31c2f61e99c/1jnpavq4c';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          
          s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  );
}