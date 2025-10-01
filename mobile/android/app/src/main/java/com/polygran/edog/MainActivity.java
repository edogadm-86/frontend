package com.polygran.edog;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = (WebView) bridge.getWebView();
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
        // Ensure WebView allows file:// and content:// URLs
        getBridge().getWebView().getSettings().setAllowFileAccess(true);
        getBridge().getWebView().getSettings().setAllowContentAccess(true);
    }
}
