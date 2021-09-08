<?php
namespace App\Twig;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Twig\TwigFilter;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;






class AppExtension extends AbstractExtension
{
    public function getFunctions()
    {
        return [
            new TwigFunction('time', [$this, 'time']),
            new TwigFunction('html_selected', [$this, 'html_selected'])
        ];
    }


    public function getFilters()
    {
        return [
            new TwigFilter('detailed_time', [$this, 'detailed_time']),
            new TwigFilter('ordinal_date', [$this, 'ordinal_date']),
            new TwigFilter('ordinal_time', [$this, 'ordinal_time']),
            new TwigFilter('raw_number_format', [$this, 'raw_number_format']),
            new TwigFilter('day_timestamp', [$this, 'day_timestamp'])
        ];
    }


    public function time()
    {
        return time();
    }


    public function detailed_time($time){
        return date("l, jS F,Y \a\\t g:ia",$time);
    }


    public function ordinal_date($time){
        return date("d/m/y",$time);
    }


    public function ordinal_time($time){
        return date("g:ia",$time);
    }

    public function raw_number_format($number){
        if($number===null || (int)$number===0){
            $string = "";
        }else{
            return number_format($number);
        }
    }


    public function day_timestamp($timestamp,$hour_in_day){
        return day_timestamp($timestamp,$hour_in_day);
    }


    public function html_selected($selected_option,$html_select_attributes,$options_and_values_array,$has_placeholder = true){
        return html_selected($selected_option,$html_select_attributes,$options_and_values_array,$has_placeholder);
    }

}





$loader = new FilesystemLoader(__DIR__);
$twig = new Environment($loader,[
    'debug' => true
]);

$twig->addExtension(new AppExtension());
$twig->addExtension(new \Twig\Extension\DebugExtension());

?>