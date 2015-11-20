package com.hyg.ble;

import java.util.List;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;

import com.neovisionaries.bluetooth.ble.advertising.ADPayloadParser;
import com.neovisionaries.bluetooth.ble.advertising.ADStructure;
import com.neovisionaries.bluetooth.ble.advertising.LocalName;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;
import android.util.Log;

public class Ble extends CordovaPlugin {

	
	
    private BluetoothAdapter.LeScanCallback mLeScanCallback =
            new BluetoothAdapter.LeScanCallback() {
        @Override
        public void onLeScan(final BluetoothDevice device, int rssi,
                byte[] scanRecord) {
        	 List<ADStructure> structures = ADPayloadParser.getInstance().parse(scanRecord);
        	 for(int i =0;i<structures.size();i++)
        	 {
        		if(structures.get(i).getType() == 9)
        		{
        				LocalName name = (LocalName)structures.get(i);
        				if(name.getLocalName().equals(_name))
        				{
        					mHandler.removeCallbacks(r);
        					PluginResult r = new PluginResult(PluginResult.Status.OK, "success");
        					r.setKeepCallback(true);
        					mBluetoothAdapter.stopLeScan(this);
        					_context.sendPluginResult(r);
        				}
        		}
        	 }
        	
             
       }
    };
    private BluetoothAdapter mBluetoothAdapter;
    private boolean mScanning;
    private Handler mHandler = new Handler();
    private String _name = null;
    private CallbackContext _context;
    Runnable r =  new Runnable() {
        @Override
        public void run() {
            mScanning = false;
            mBluetoothAdapter.stopLeScan(mLeScanCallback);
            PluginResult r = new PluginResult(PluginResult.Status.OK, "false");
			r.setKeepCallback(true);
			
			_context.sendPluginResult(r);
        }
    };
    @Override
    public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {

        if (action.equals("scanBlue")) {
        	_context = callbackContext;
            _name = data.getString(0);
            //
          

            mScanning = true;
            BluetoothManager bluetoothManager = (BluetoothManager) cordova.getActivity().getSystemService(Context.BLUETOOTH_SERVICE);
            mBluetoothAdapter = bluetoothManager.getAdapter();
            if (mBluetoothAdapter == null || !mBluetoothAdapter.isEnabled()) {
                Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                cordova.getActivity().startActivityForResult(enableBtIntent, 1);
                mBluetoothAdapter.stopLeScan(mLeScanCallback);
                PluginResult r = new PluginResult(PluginResult.Status.OK, "false");
    			r.setKeepCallback(true);
    			
    			_context.sendPluginResult(r);
            }else
            {
            mHandler.postDelayed(r, 10000);
            mBluetoothAdapter.startLeScan(mLeScanCallback);

            }
            
          
            //
            return true;

        } else {
            
            return false;

        }
    }
}
