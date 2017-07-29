<?php

require_once(__DIR__.'/vendor/autoload.php');

$params = array();
$params['UstId_1']    = 'DE815358108';
$params['UstId_2']    = 'ATU6911673';
$params['Firmenname'] = 'Coinimal GmbH';
$params['Ort']        = 'Wien';
$params['PLZ']        = '';
$params['Strasse']    = '';
$params['Druck']      = 'nein';

$url = 'https://evatr.bff-online.de/evatrRPC?' . http_build_query($params);

$response = file_get_contents($url);

print_r($response);



