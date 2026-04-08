package com.meetfound.app;

import android.content.Intent;
import android.net.Uri;
import android.util.Base64;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

@CapacitorPlugin(name = "SaveAs")
public class SaveAsPlugin extends Plugin {

    @PluginMethod
    public void saveBase64(PluginCall call) {
        String base64 = call.getString("base64");
        if (base64 == null || base64.isEmpty()) {
            call.reject("Missing base64 data");
            return;
        }

        String mimeType = call.getString("mimeType", "application/octet-stream");
        String fileName = call.getString("fileName", "download");

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, fileName);

        startActivityForResult(call, intent, "saveBase64Result");
    }

    @ActivityCallback
    public void saveBase64Result(PluginCall call, ActivityResult result) {
        if (result.getResultCode() != android.app.Activity.RESULT_OK) {
            call.reject("User cancelled");
            return;
        }

        Intent data = result.getData();
        if (data == null) {
            call.reject("No destination selected");
            return;
        }

        Uri uri = data.getData();
        if (uri == null) {
            call.reject("No destination selected");
            return;
        }

        String base64 = call.getString("base64");
        if (base64 == null || base64.isEmpty()) {
            call.reject("Missing base64 data");
            return;
        }

        try (OutputStream out = getContext().getContentResolver().openOutputStream(uri, "w")) {
            if (out == null) {
                call.reject("Unable to open destination");
                return;
            }

            // Decode and write. For typical exports this is fine; if exports become very large,
            // we can switch this to a streaming decoder.
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            out.write(bytes);
            out.flush();
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to save file: " + e.getMessage(), e);
        }
    }
}
