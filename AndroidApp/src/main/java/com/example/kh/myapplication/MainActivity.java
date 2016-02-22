package com.example.kh.myapplication;

import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;
import java.net.URISyntaxException;


public class MainActivity extends AppCompatActivity {

    private EditText username;
    private TextView percentage;


    private Socket mSocket;
    {
        try {
            mSocket = IO.socket("http://adnxdsocket.herokuapp.com/");
        } catch (URISyntaxException e) { throw new RuntimeException(e);}
    }

    private float scale = 1f;
    private ScaleGestureDetector SGD;

    private class ScaleListener extends ScaleGestureDetector.

            SimpleOnScaleGestureListener {
        @Override
        public boolean onScale(ScaleGestureDetector detector) {

            //get current scale of zooming
            scale *= detector.getScaleFactor();
            scale = Math.max(0.1f, Math.min(scale, 5.0f));

            //build the json to summit to the socket server
            try {
                JSONObject  currentJson= new JSONObject();

                currentJson.put("user", username.getText().toString());
                currentJson.put("newv", String.valueOf(scale));
                mSocket.emit("fusion360", currentJson);

                //refreash the percentage text
                percentage.setText(String.valueOf(scale));
            } catch (JSONException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            return true;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        SGD = new ScaleGestureDetector(this,new ScaleListener());

        mSocket.connect();
        username = (EditText) findViewById(R.id.inputUserName);
        percentage = (TextView)findViewById(R.id.txtPercentage);
    }
    public boolean onTouchEvent(MotionEvent ev) {
        SGD.onTouchEvent(ev);
        return true;
    }
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
